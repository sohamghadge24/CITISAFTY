
import torch
import torch.nn as nn
from torchvision import models, transforms
from torch.utils.data import DataLoader
import argparse
import os
import sys
from tqdm import tqdm
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Adjust path to import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dataset import (
    TrafficSeverityDataset, 
    TrafficViolationDataset, 
    CarScratchDataset,
    get_transforms, 
    SEVERITY_CLASSES
)

def build_model(num_classes=3, pretrained=False, arch="resnet18"):
    """
    Builds the ResNet model with the same architecture as training.
    """
    if arch == "resnet18":
        print("Building ResNet-18...")
        model = models.resnet18(pretrained=pretrained)
    else:
        print("Building ResNet-50...")
        model = models.resnet50(pretrained=pretrained)
    
    num_ftrs = model.fc.in_features
    # Custom head: Linear -> ReLU -> Dropout -> Linear
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 512),
        nn.ReLU(),
        nn.Dropout(0.2 if arch == "resnet18" else 0.3),
        nn.Linear(512, num_classes)
    )
    return model

def validate_model(checkpoint_path, data_dir, dataset_type="accident", batch_size=32, device='cpu', arch="resnet18"):
    print(f"Loading model from {checkpoint_path}...")
    
    if not os.path.exists(checkpoint_path):
        print(f"Error: Checkpoint file '{checkpoint_path}' not found!")
        return

    # Initialize Dataset
    if dataset_type == "accident":
        DatasetClass = TrafficSeverityDataset
        target_names = ["Low", "Medium", "High"]
        num_classes = 3
    elif dataset_type == "violation":
        DatasetClass = TrafficViolationDataset
        # We need to instantiate to find classes if dynamic, or assume logic
        # For validation, we prefer dynamic but we need to know num_classes for model build
        # Let's peek at dataset first?
        temp_ds = TrafficViolationDataset(root_dir=data_dir, split="test", transform=None)
        target_names = [str(c) for c in temp_ds.classes]
        num_classes = len(target_names)
    elif dataset_type == "scratch":
        DatasetClass = CarScratchDataset
        temp_ds = CarScratchDataset(root_dir=data_dir, split="test", transform=None)
        target_names = [str(c) for c in temp_ds.classes]
        num_classes = len(target_names)
    else:
        raise ValueError("Unknown dataset type")

    # Build model
    model = build_model(num_classes=num_classes, arch=arch)
    
    # Load weights
    try:
        # Map location to CPU if CUDA is not available
        state_dict = torch.load(checkpoint_path, map_location=device)
        model.load_state_dict(state_dict)
    except Exception as e:
        print(f"Error loading state dict: {e}")
        return

    model = model.to(device)
    model.eval()
    
    # Dataset and Loader
    try:
        if dataset_type == "accident":
             # Accident handles paths inside
             test_dataset = DatasetClass(root_dir=data_dir, split="test", transform=get_transforms("val"))
        else:
             # Others use same logic
             test_dataset = DatasetClass(root_dir=data_dir, split="test", transform=get_transforms("val"))
             
        test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    y_true = []
    y_pred = []
    
    print(f"Running inference on test set ({len(test_dataset)} samples)...")
    with torch.no_grad():
        for images, labels in tqdm(test_loader):
            images = images.to(device)
            labels = labels.to(device)
            
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            
            y_true.extend(labels.cpu().numpy())
            y_pred.extend(predicted.cpu().numpy())
            
    # Calculate metrics
    print("\n" + "="*50)
    print("TEST RESULTS")
    print("="*50)
    
    # Classification Report
    print("\nClassification Report:")
    all_labels = list(range(num_classes))
    report = classification_report(y_true, y_pred, labels=all_labels, target_names=target_names, zero_division=0)
    print(report)
    
    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    print("\nConfusion Matrix:")
    print(cm)
    
    # Calculate Overall Accuracy
    accuracy = np.sum(np.array(y_true) == np.array(y_pred)) / len(y_true)
    print(f"\nOverall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("="*50)

def main():
    parser = argparse.ArgumentParser(description="Validate Traffic Model")
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to model checkpoint")
    parser.add_argument("--data_dir", type=str, required=True, help="Dataset root directory")
    parser.add_argument("--dataset_type", type=str, default="accident", choices=["accident", "violation", "scratch"], help="Type of dataset")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Device (cuda/cpu)")
    parser.add_argument("--arch", type=str, default="resnet18", choices=["resnet18", "resnet50"], help="Model Architecture")
    
    args = parser.parse_args()
    
    validate_model(args.checkpoint, args.data_dir, args.dataset_type, device=args.device, arch=args.arch)

if __name__ == "__main__":
    main()

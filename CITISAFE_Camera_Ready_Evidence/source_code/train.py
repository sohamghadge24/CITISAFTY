
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import models
from tqdm import tqdm
import time
import os
import argparse
import sys

# Adjust path to import from local modules if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dataset import (
    TrafficSeverityDataset, 
    TrafficViolationDataset, 
    CarScratchDataset, 
    get_transforms, 
    SEVERITY_CLASSES
)

# Define arguments
parser = argparse.ArgumentParser(description="Train ResNet-50 for Traffic Tasks")
parser.add_argument("--dataset_type", type=str, default="accident", choices=["accident", "violation", "scratch"], help="Type of dataset to train on")
parser.add_argument("--epochs", type=int, default=30, help="Number of epochs to train (Increased default)")
parser.add_argument("--batch_size", type=int, default=32, help="Batch size (default: 32)")
parser.add_argument("--lr", type=float, default=0.0001, help="Learning rate (Lowered default)")
parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", help="Device (cuda/cpu)")
parser.add_argument("--checkpoint", type=str, default=None, help="Checkpoint save path (default: best_model_<type>.pth)")
parser.add_argument("--phase", type=str, default="auto", choices=["head", "finetune", "auto"], help="Training phase: 'head', 'finetune', or 'auto' (automatic unfreezing)")
parser.add_argument("--data_dir", type=str, required=True, help="Dataset root directory")

args = parser.parse_args()

class FocalLoss(nn.Module):
    def __init__(self, alpha=[2.0, 3.0, 1.5], gamma=2):
        super().__init__()
        self.alpha = torch.tensor(alpha)
        self.gamma = gamma

    def forward(self, inputs, targets):
        ce_loss = nn.functional.cross_entropy(inputs, targets, reduction='none')
        pt = torch.exp(-ce_loss)
        alpha_t = self.alpha.to(inputs.device)[targets]
        focal_loss = (alpha_t * (1 - pt) ** self.gamma * ce_loss).mean()
        return focal_loss

def build_model(num_classes=4, pretrained=True):
    """
    Builds the EfficientNet-B0 model with a custom FC head.
    """
    print(f"Building model (EfficientNet-B0) with {num_classes} classes...")
    model = models.efficientnet_b0(pretrained=pretrained)
    
    # Freeze all layers first
    for param in model.parameters():
        param.requires_grad = False
        
    num_ftrs = model.classifier[1].in_features
    # Custom head for EfficientNet
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(num_ftrs, num_classes)
    )
    
    # Only classifier parameters should be trainable initially
    for param in model.classifier.parameters():
        param.requires_grad = True
        
    return model

def unfreeze_top_layers(model):
    """
    Unfreezes the top layers (features) of EfficientNet for fine-tuning.
    """
    # Unfreeze the last few blocks of features
    for name, param in model.features.named_parameters():
        if int(name.split('.')[0]) >= 6: # Unfreeze blocks 6, 7, 8
            param.requires_grad = True
    print("Unfrozen top features for fine-tuning.")
    return model

def train_epoch(model, loader, criterion, optimizer, scaler, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    loop = tqdm(loader, desc="Training")
    
    for images, labels in loop:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        
        # Mixed Precision Training
        if device == "cuda":
            with torch.cuda.amp.autocast():
                outputs = model(images)
                loss = criterion(outputs, labels)
            
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
             # CPU fallback (no AMP)
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        loop.set_postfix(loss=loss.item())
        
    epoch_loss = running_loss / total if total > 0 else 0
    epoch_acc = 100. * correct / total if total > 0 else 0
    return epoch_loss, epoch_acc

def validate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
    val_loss = running_loss / total if total > 0 else 0
    val_acc = 100. * correct / total if total > 0 else 0
    return val_loss, val_acc

def main():
    print(f"Using device: {args.device}")
    print(f"Dataset Type: {args.dataset_type}")
    
    # 1. Initialize Datasets
    if args.dataset_type == "accident":
        DatasetClass = TrafficSeverityDataset
    elif args.dataset_type == "violation":
        DatasetClass = TrafficViolationDataset
    elif args.dataset_type == "scratch":
        DatasetClass = CarScratchDataset
    else:
        raise ValueError("Unknown dataset type")

    print(f"Loading data from {args.data_dir}...")
    train_dataset = DatasetClass(root_dir=args.data_dir, split="train", transform=get_transforms("train"))
    val_dataset = DatasetClass(root_dir=args.data_dir, split="val", transform=get_transforms("val"))
    
    if len(train_dataset) == 0:
        print("Error: Train dataset is empty!")
        return

    # 2. Determine Number of Classes
    if hasattr(train_dataset, 'classes') and train_dataset.classes:
        num_classes = len(train_dataset.classes)
        class_names = train_dataset.classes
    else:
        # Fallback for Accident dataset (hardcoded 3)
        num_classes = 3 
        class_names = ["Low", "Medium", "High"]
    
    print(f"Classes found ({num_classes}): {class_names}")

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4, pin_memory=True)
    
    # 3. Model Setup
    model = build_model(num_classes=num_classes)
    model = model.to(args.device)
    
    # Checkpoint name handling
    checkpoint_path = args.checkpoint
    if not checkpoint_path:
        checkpoint_path = f"best_model_{args.dataset_type}.pth"
    
    # Training Configuration
    learning_rate = args.lr
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=learning_rate)
    
    if args.dataset_type == "accident":
        # Use Focal Loss with higher alpha weights for minority/difficult classes
        # Low: 2.0, Medium: 3.0 (underrepresented), High: 1.5
        criterion = FocalLoss(alpha=[2.0, 3.0, 1.5], gamma=2.0)
    else:
        criterion = nn.CrossEntropyLoss()
        
    scaler = torch.cuda.amp.GradScaler(enabled=(args.device == "cuda"))
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3)

    # Early Unfreezing Logic (Auto Phase) - Adjusted
    unfreeze_at_epoch = 3 if args.phase == "auto" else 999
    
    best_acc = 0.0
    
    for epoch in range(args.epochs):
        print(f"Epoch {epoch+1}/{args.epochs}")
        
        # Check for unfreezing
        if args.phase == "auto" and epoch == unfreeze_at_epoch:
            print("\n>>> Auto-Unfreezing Top Layers for Fine-Tuning <<<")
            model = unfreeze_top_layers(model)
            # Recreate optimizer with lower LR for fine-tuning
            trainable_params = filter(lambda p: p.requires_grad, model.parameters())
            optimizer = optim.AdamW(trainable_params, lr=learning_rate * 0.1)
        
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, scaler, args.device)
        val_loss, val_acc = validate(model, val_loader, criterion, args.device)
        
        scheduler.step(val_loss)
        
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), checkpoint_path)
            print(f"Saved new best model with acc: {val_acc:.2f}% to {checkpoint_path}")
            
    print("Training complete.")

if __name__ == "__main__":
    main()

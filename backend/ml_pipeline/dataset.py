
import os
import cv2
import pandas as pd
import torch
from torch.utils.data import Dataset
import albumentations as A
from albumentations.pytorch import ToTensorV2
from pathlib import Path

# Legacy mappings for Accident Severity
SEVERITY_CLASSES = {
    "Low": 0,
    "Medium": 1,
    "High": 2
}

FOLDER_MAPPING = {
    "minor": "Low",
    "moderate": "Medium", 
    "major": "High", # Upgraded from Critical to fill the High slot
    "Low": "Low",
    "Medium": "Medium",
    "High": "High",
    "low": "Low",
    "medium": "Medium",
    "high": "High"
}

# --- Base Dataset Class with Common Loading Logic ---
class BaseImageDataset(Dataset):
    def load_image(self, img_path):
        image = None
        # Handle Video Files
        abs_path = str(Path(img_path).resolve())
        if str(img_path).lower().endswith(('.mp4', '.avi', '.mov')):
            cap = cv2.VideoCapture(abs_path)
            if cap.isOpened():
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                if total_frames > 10:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 10)
                ret, frame = cap.read()
                if ret:
                    image = frame
                cap.release()
        else:
            # Handle Image Files
            image = cv2.imread(abs_path)
        
        if image is None:
            raise ValueError(f"Failed to load image/video: {img_path}")
        
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    def apply_transform(self, image):
        if self.transform:
            augmented = self.transform(image=image)
            image = augmented["image"]
        else:
            default_tf = A.Compose([
                A.Resize(224, 224),
                A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
                ToTensorV2()
            ])
            image = default_tf(image=image)["image"]
        return image

# --- Existing Accident Dataset (Preserved) ---
class TrafficSeverityDataset(BaseImageDataset):
    def __init__(self, root_dir, split="train", transform=None):
        self.root_dir = Path(root_dir) / split
        self.transform = transform
        self.image_paths = []
        self.labels = []
        
        # Fallback if train/val subfolders don't exist
        if not self.root_dir.exists():
            self.root_dir = Path(root_dir)
            if not self.root_dir.exists():
                print(f"Warning: {self.root_dir} does not exist. Skipping.")
                return

        for folder_path in self.root_dir.iterdir():
            if not folder_path.is_dir():
                continue
            folder_name = folder_path.name
            if folder_name in FOLDER_MAPPING:
                target_class = FOLDER_MAPPING[folder_name]
                if target_class in SEVERITY_CLASSES:
                    class_idx = SEVERITY_CLASSES[target_class]
                    for img_path in folder_path.glob("*"):
                        if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.mp4', '.avi']:
                            self.image_paths.append(str(img_path))
                            self.labels.append(class_idx)
        
        print(f"[Accident] Loaded {len(self.image_paths)} items for split '{split}'")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        image = self.load_image(img_path)
        image = self.apply_transform(image)
        return image, torch.tensor(label, dtype=torch.long)

# --- New: Traffic Violation Dataset (Dynamic Folders) ---
class TrafficViolationDataset(BaseImageDataset):
    def __init__(self, root_dir, split="train", transform=None):
        # Map generic split names to actual folder names
        # 'train' -> 'Training data'
        # 'test' -> 'Test data'
        # 'val' -> 'validation data'
        
        split_map = {
            "train": "Training data",
            "test": "Test data",
            "val": "validation data"
        }
        
        actual_split = split_map.get(split, split)
        self.root_dir = Path(root_dir) / actual_split
        self.transform = transform
        self.image_paths = []
        self.labels = []
        self.classes = []
        
        if not self.root_dir.exists():
             # Fallback if capitalization differs (e.g. 'Test Data')
            parent = Path(root_dir)
            found = False
            if parent.exists():
                for item in parent.iterdir():
                    if item.is_dir() and item.name.lower() == actual_split.lower():
                        self.root_dir = item
                        found = True
                        break
            if not found:
                 print(f"Warning: {self.root_dir} not found for split {split}")
                 return

        # Dynamically discover classes
        # Exclude hidden files
        subdirs = [d for d in self.root_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
        self.classes = sorted([d.name for d in subdirs])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        print(f"[Violation] Found classes: {self.class_to_idx}")

        for cls_name in self.classes:
            cls_dir = self.root_dir / cls_name
            idx = self.class_to_idx[cls_name]
            for img_path in cls_dir.glob("*"):
                if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']:
                    self.image_paths.append(str(img_path))
                    self.labels.append(idx)

        print(f"[Violation] Loaded {len(self.image_paths)} items for split '{split}'")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        image = self.load_image(img_path)
        image = self.apply_transform(image)
        return image, torch.tensor(label, dtype=torch.long)

# --- New: Scratch Car Dataset (CSV Based) ---
class CarScratchDataset(BaseImageDataset):
    def __init__(self, root_dir, split="train", transform=None):
        # Scratch dataset doesn't seem to have train/test splits in folders
        # It has 'images' folder and 'labels.csv'
        # We might need to split it manually or use provided logic
        # For now, we'll verify if 'train' or 'test' is requested and how to handle it.
        # IF the user wants auto-split, we can do it here using hash or random.
        
        self.root_dir = Path(root_dir)
        self.img_dir = self.root_dir / "images"
        self.csv_path = self.root_dir / "labels.csv"
        self.transform = transform
        self.image_paths = []
        self.labels = []
        
        if not self.csv_path.exists():
             print(f"Warning: CSV not found at {self.csv_path}")
             return
             
        df = pd.read_csv(self.csv_path)
        # Expected cols: image_id, filename, label
        # We need to split this df into train/val/test if not already split
        
        # Simple deterministic split based on index
        # 80% train, 10% val, 10% test
        total = len(df)
        indices = list(range(total))
        
        # Determine range based on split
        if split == "train":
            subset_indices = indices[:int(0.8 * total)]
        elif split == "val":
            subset_indices = indices[int(0.8 * total):int(0.9 * total)]
        elif split == "test":
            subset_indices = indices[int(0.9 * total):]
        else:
            subset_indices = []

        subset_df = df.iloc[subset_indices]
        
        # Unique classes
        self.classes = sorted(df['label'].unique().tolist())
        self.class_to_idx = {cls: i for i, cls in enumerate(self.classes)} # Should be 0,1 map to 0,1

        for _, row in subset_df.iterrows():
            fname = row['filename']
            label = row['label']
            
            # Filename might be full path or relative?
            # "1.jpg"
            full_path = self.img_dir / fname
            if full_path.exists():
                self.image_paths.append(str(full_path))
                self.labels.append(self.class_to_idx[label])

        print(f"[Scratch] Loaded {len(self.image_paths)} items for split '{split}' (Classes: {self.classes})")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        image = self.load_image(img_path)
        image = self.apply_transform(image)
        return image, torch.tensor(label, dtype=torch.long)


def get_transforms(phase="train"):
    if phase == "train":
        return A.Compose([
            A.Resize(256, 256),
            A.RandomResizedCrop(size=(224, 224), scale=(0.6, 1.0)), # Stronger zoom/crop for minor details
            A.HorizontalFlip(p=0.5),
            A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.1, rotate_limit=15, p=0.4),
            A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.4),
            A.CoarseDropout(p=0.3), # Cutout effect
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2()
        ])
    else:
        return A.Compose([
            A.Resize(256, 256),
            A.CenterCrop(224, 224),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2()
        ])


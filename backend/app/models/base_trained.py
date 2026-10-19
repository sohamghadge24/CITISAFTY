
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from io import BytesIO
import os
from .base import BaseTrafficModel
from ..core.config import settings
from typing import Dict, Any, List

class BaseTrainedResNet(BaseTrafficModel):
    def __init__(self, model_id: str, version: str, num_classes: int, weights_path: str, classes: list):
        super().__init__(model_id, version)
        self.num_classes = num_classes
        self.weights_path = weights_path
        self.classes = classes
        self.model = None
        
        # Standard transform for ResNet
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    async def load(self):
        if self.model is None:
            # Build architecture (ResNet-18)
            self.model = models.resnet18(pretrained=False) # No need for ImageNet weights if we load custom
            num_ftrs = self.model.fc.in_features
            self.model.fc = nn.Sequential(
                nn.Linear(num_ftrs, 512),
                nn.ReLU(),
                nn.Dropout(0.2), # Adjusted to match training
                nn.Linear(512, self.num_classes)
            )
            
            # Load weights
            if os.path.exists(self.weights_path):
                # Load on CPU first to be safe, then move to device
                state_dict = torch.load(self.weights_path, map_location=settings.DEVICE)
                self.model.load_state_dict(state_dict)
                print(f"Loaded weights for {self.model_id} from {self.weights_path}")
            else:
                print(f"Warning: Weights not found at {self.weights_path}. Using random initialization.")
            
            self.model.to(settings.DEVICE)
            self.model.eval()

    async def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        await self.load()
        try:
            img = Image.open(BytesIO(image_bytes)).convert('RGB')
            input_tensor = self.transform(img).unsqueeze(0).to(settings.DEVICE)
            
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                top_probs, top_idxs = torch.topk(probs, min(3, self.num_classes))
            
            # Helper to get class name safely
            def get_class(idx):
                if 0 <= idx < len(self.classes):
                    return self.classes[idx]
                return str(idx)

            top_results = []
            for i in range(len(top_probs[0])):
                score = top_probs[0][i].item()
                idx = top_idxs[0][i].item()
                top_results.append({
                    "class": get_class(idx),
                    "confidence": score
                })
            
            # Primary prediction
            primary = top_results[0]
            
            return {
                "label": primary["class"],
                "confidence": primary["confidence"],
                "top_predictions": top_results
            }
        except Exception as e:
            print(f"Prediction error in {self.model_id}: {e}")
            return {"error": str(e)}

    async def evaluate(self, test_dataset: List[Dict]) -> Dict[str, float]:
        return {"status": "Not implemented for production model wrapper"}

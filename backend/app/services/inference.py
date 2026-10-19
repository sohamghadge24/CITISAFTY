import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from io import BytesIO
import os
from ..core.config import settings
from ..core.logging import logger

class InferenceService:
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InferenceService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.device = torch.device(settings.DEVICE if torch.cuda.is_available() else "cpu")
        self.model = None
        logger.info(f"Initializing Inference Service (Lazy Load) on {self.device}")
        
        # Define Transform (Must match validation transform)
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
    def load_model(self):
        if self.model is None:
            logger.info("Lazy loading custom ResNet-50 weights into memory...")
            try:
                # Load ResNet-50 architecture
                self.model = models.resnet50(pretrained=False) # We load our own weights
                
                # Recreate the custom head as defined in training
                num_ftrs = self.model.fc.in_features
                self.model.fc = nn.Sequential(
                    nn.Linear(num_ftrs, 512),
                    nn.ReLU(),
                    nn.Dropout(0.3),
                    nn.Linear(512, 4) # 4 Classes: Low, Medium, High, Critical
                )
                
                # Load trained weights if available, else standard weights or initialization
                weights_path = "best_model.pth" # Default path from train.py
                if os.path.exists(weights_path):
                    state_dict = torch.load(weights_path, map_location=self.device)
                    self.model.load_state_dict(state_dict)
                    logger.info(f"Loaded custom ResNet-50 weights from {weights_path}")
                else:
                    logger.warning("Custom weights not found. Loading ImageNet pretrained for backbone (Testing Mode).")
                    self.model = models.resnet50(pretrained=True)
                    # Adjust head again after loading pretrained
                    self.model.fc = nn.Sequential(
                        nn.Linear(num_ftrs, 512),
                        nn.ReLU(),
                        nn.Dropout(0.3),
                        nn.Linear(512, 4)
                    )
                    
                self.model.to(self.device)
                self.model.eval()
            except Exception as e:
                logger.error(f"Failed to initialize Inference Service: {e}")
                raise RuntimeError("Failed to load Inference Model")

    def predict_image(self, image_bytes: bytes):
        self.load_model()
            
        try:
            img = Image.open(BytesIO(image_bytes)).convert('RGB')
            img_tensor = self.transform(img).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                logits = self.model(img_tensor)
                probs = torch.nn.functional.softmax(logits, dim=1)
                
            # Get class index and confidence
            conf, class_idx = torch.max(probs, 1)
            
            return {
                "logits": logits.cpu().numpy().tolist(),
                "probs": probs.cpu().numpy().tolist()[0],
                "class_idx": class_idx.item(),
                "confidence": conf.item()
            }
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise

inference_service = InferenceService()

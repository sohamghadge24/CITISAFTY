import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../src/constants/theme';
import { Camera, X, Check, MapPin, Activity, AlertTriangle, ShieldAlert, BrainCircuit } from 'lucide-react-native';
import { edgeMLService } from '../../src/services/ml';
import { ReportService } from '../../src/services/api';

const IncidentCategories = [
    { id: 'accident', label: 'Accident', icon: ShieldAlert, color: Colors.alert },
    { id: 'violation', label: 'Traffic Violation', icon: Camera, color: Colors.primary },
    { id: 'hazard', label: 'Road Hazard', icon: AlertTriangle, color: '#F59E0B' },
    { id: 'jam', label: 'Traffic Jam', icon: Activity, color: '#F97316' },
];

export default function ReportScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<any>(null);
    const [category, setCategory] = useState<string | null>(null);

    // Edge AI State
    const [isInferencing, setIsInferencing] = useState(false);
    const [edgeResult, setEdgeResult] = useState<{ caption: string, edgeSeverity: string } | null>(null);

    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        // Preload Mobile WASM/ONNX simulation
        edgeMLService.init();
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const result = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: false
            });
            setPhoto(result);

            // Attempt Edge AI captioning upon picture
            runEdgeInference(result);
        }
    };

    const runEdgeInference = async (imageResult: any) => {
        setIsInferencing(true);
        setEdgeResult(null);
        try {
            const result = await edgeMLService.generateCaption(imageResult.uri);
            setEdgeResult({
                caption: result.caption,
                edgeSeverity: result.edgeSeverity
            });
        } catch (err) {
            console.log('Edge AI failed');
        } finally {
            setIsInferencing(false);
        }
    };

    const uploadReport = async () => {
        alert(`Hybrid Upload Started. Sending image and caption "${edgeResult?.caption}" to backend CNN for final fusion...`);

        setPhoto(null);
        setCategory(null);
        setEdgeResult(null);
    };

    const resetPhoto = () => {
        setPhoto(null);
        setCategory(null);
        setEdgeResult(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Report Incident</Text>
                <Text style={styles.headerSubtitle}>Citizen Smart City Input</Text>
            </View>

            {!photo ? (
                <View style={styles.content}>
                    <View style={styles.cameraContainer}>
                        <CameraView style={styles.camera} ref={cameraRef} facing="back" />

                        <View style={styles.cameraOverlay}>
                            <View style={styles.gpsMetadata}>
                                <MapPin color={Colors.white} size={14} />
                                <Text style={styles.gpsText}>GPS Active: Analyzing Location...</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.content}>
                    <Image source={{ uri: photo.uri }} style={styles.previewImage} />

                    {/* EDGE AI HYBRID FUSION BLOCK */}
                    <View style={styles.aiBlock}>
                        <View style={styles.aiHeader}>
                            <BrainCircuit color={Colors.primary} size={20} />
                            <Text style={styles.aiTitle}>Edge AI Analysis (BLIP)</Text>
                        </View>

                        {isInferencing ? (
                            <View style={styles.aiLoading}>
                                <ActivityIndicator color={Colors.primary} size="small" />
                                <Text style={styles.aiLoadingText}>Running local Transformers.js model...</Text>
                            </View>
                        ) : edgeResult ? (
                            <View>
                                <Text style={styles.edgeCaption}>&quot;{edgeResult.caption}&quot;</Text>
                                <View style={styles.edgeTagRow}>
                                    <View style={styles.edgeTag}>
                                        <Text style={styles.edgeTagText}>Severity: {edgeResult.edgeSeverity}</Text>
                                    </View>
                                    <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 4 }}>Ready for backend ResNet fusion</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ color: Colors.alert }}>Edge inference failed.</Text>
                        )}
                    </View>

                    <Text style={styles.categoryTitle}>Verify Incident Type</Text>
                    <View style={styles.categoryGrid}>
                        {IncidentCategories.map((c) => {
                            const Icon = c.icon;
                            const isSelected = category === c.id;
                            return (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[
                                        styles.categoryCard,
                                        isSelected && { borderColor: c.color, backgroundColor: 'rgba(30, 41, 59, 1)' }
                                    ]}
                                    onPress={() => setCategory(c.id)}
                                >
                                    <Icon color={isSelected ? c.color : Colors.textSecondary} size={28} />
                                    <Text style={[styles.categoryLabel, isSelected && { color: c.color }]}>{c.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.retakeButton} onPress={resetPhoto}>
                            <X color={Colors.white} size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryButton, (!category || isInferencing) && { opacity: 0.5 }]}
                            disabled={!category || isInferencing}
                            onPress={uploadReport}
                        >
                            <Check color={Colors.white} size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Submit Report</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    cameraContainer: {
        height: 400,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 30,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: 16,
    },
    gpsMetadata: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    gpsText: {
        color: Colors.white,
        fontSize: 12,
        marginLeft: 6,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    captureButton: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.white,
    },
    previewImage: {
        height: 180, // Made smaller to fit the AI box
        borderRadius: 20,
        marginBottom: 16,
    },
    aiBlock: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    aiTitle: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
    aiLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    aiLoadingText: {
        color: Colors.textSecondary,
        marginLeft: 10,
        fontSize: 13,
    },
    edgeCaption: {
        color: Colors.white,
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    edgeTagRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    edgeTag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    edgeTagText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '700',
    },
    categoryTitle: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: Colors.cardSurface,
        padding: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryLabel: {
        color: Colors.textSecondary,
        marginTop: 10,
        fontWeight: '600',
        fontSize: 13,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        marginBottom: 20,
    },
    retakeButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.textSecondary,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    primaryButton: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 16,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
        padding: 20,
    },
    permissionText: {
        color: Colors.white,
        fontSize: 16,
        marginBottom: 20,
    },
});

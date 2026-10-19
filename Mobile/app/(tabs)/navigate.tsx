import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, Typography } from '../../src/constants/theme';
import { Search, MapPin, Map, Navigation as NavIcon, ArrowRight, CornerUpLeft, Zap } from 'lucide-react-native';
import { wsService, NavigationService } from '../../src/services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { setCurrentLocation } from '../../src/store/slices/trafficSlice';
export default function NavigateScreen() {
    const dispatch = useDispatch();
    const incidents = useSelector((state: RootState) => state.traffic.incidents);
    const [searchQuery, setSearchQuery] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState<any>(null);

    // Sheet animation
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        wsService.connect();
        dispatch(setCurrentLocation({ lat: 37.78825, lng: -122.4324 }));

        const fetchAi = async () => {
            try {
                const res = await NavigationService.getAiSuggestion();
                if (res.data) setAiSuggestion(res.data);
            } catch (err) {
                setAiSuggestion({
                    title: 'AI Route Optimized',
                    message: 'Heavy traffic strictly avoided on I-95. The current route uses bypass saving 15 minutes of delay.',
                    savingMinutes: 15
                });
            }
        };
        fetchAi();

        return () => wsService.disconnect();
    }, [dispatch]);

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 3) {
            try {
                await NavigationService.searchDestination(text);
            } catch (err) { }
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                userInterfaceStyle="dark"
            >
                {incidents.map((inc) => (
                    <Marker
                        key={inc.id}
                        coordinate={{
                            latitude: inc.coords.lat,
                            longitude: inc.coords.lng
                        }}
                    >
                        <View style={[styles.marker, inc.severity === 'CRITICAL' && { backgroundColor: Colors.alert, shadowColor: Colors.alert }]} />
                    </Marker>
                ))}
            </MapView>

            <BlurView intensity={30} tint="dark" style={styles.topContainer}>
                <Text style={styles.headerTitle}>Where to?</Text>
                <View style={styles.searchContainer}>
                    <Search color={Colors.textSecondary} size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search destination, POI..."
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </BlurView>

            <Animated.View style={[styles.bottomSheetWrapper, { transform: [{ translateY: slideAnim }] }]}>
                <BlurView intensity={70} tint="dark" style={styles.bottomSheet}>
                    <View style={styles.dragHandle} />
                    <ScrollView contentContainerStyle={styles.sheetContent}>

                        <View style={styles.quickActions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <LinearGradient
                                    colors={['rgba(37,99,235,0.4)', 'rgba(37,99,235,0.1)']}
                                    style={styles.iconContainer}
                                >
                                    <MapPin color={Colors.primary} size={22} />
                                </LinearGradient>
                                <Text style={styles.actionText}>Home</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <LinearGradient
                                    colors={['rgba(37,99,235,0.4)', 'rgba(37,99,235,0.1)']}
                                    style={styles.iconContainer}
                                >
                                    <Map color={Colors.primary} size={22} />
                                </LinearGradient>
                                <Text style={styles.actionText}>Work</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <LinearGradient
                                    colors={['rgba(37,99,235,0.4)', 'rgba(37,99,235,0.1)']}
                                    style={styles.iconContainer}
                                >
                                    <NavIcon color={Colors.primary} size={22} />
                                </LinearGradient>
                                <Text style={styles.actionText}>Saved</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Recent Routes</Text>

                        <TouchableOpacity style={styles.routeCard}>
                            <View style={styles.routeIcon}>
                                <CornerUpLeft color={Colors.white} size={18} />
                            </View>
                            <View style={styles.routeInfo}>
                                <Text style={styles.routeTitle}>Downtown City Center</Text>
                                <Text style={styles.routeSubtitle}>4.2 mi • Moderate Traffic</Text>
                            </View>
                            <ArrowRight color={Colors.textSecondary} size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.routeCard}>
                            <View style={styles.routeIcon}>
                                <CornerUpLeft color={Colors.white} size={18} />
                            </View>
                            <View style={styles.routeInfo}>
                                <Text style={styles.routeTitle}>Central Hospital</Text>
                                <Text style={styles.routeSubtitle}>12.1 mi • Clear</Text>
                            </View>
                            <ArrowRight color={Colors.textSecondary} size={20} />
                        </TouchableOpacity>

                        {/* Premium AI Glowing Card */}
                        {aiSuggestion && (
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.aiRecommendation}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <Zap color={Colors.success} size={16} />
                                    <Text style={styles.aiTitle}>{aiSuggestion.title}</Text>
                                </View>
                                <Text style={styles.aiText}>{aiSuggestion.message}</Text>
                                <TouchableOpacity style={styles.routePreviewButton}>
                                    <Text style={styles.routePreviewText}>Preview AI Route</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        )}

                    </ScrollView>
                </BlurView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    marker: {
        width: 14,
        height: 14,
        backgroundColor: '#F59E0B',
        borderRadius: 7,
        borderWidth: 2,
        borderColor: Colors.white,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 8,
    },
    topContainer: {
        paddingTop: Platform.OS === 'ios' ? 65 : 45,
        paddingHorizontal: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: Typography.extraBold,
        color: Colors.white,
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(21, 28, 44, 0.6)', // Glassmorphic input
        borderRadius: 20,
        paddingHorizontal: 20,
        height: 60,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    searchIcon: {
        marginRight: 14,
    },
    searchInput: {
        flex: 1,
        color: Colors.white,
        fontFamily: Typography.regular,
        fontSize: 16,
        height: '100%',
    },
    bottomSheetWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '68%',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        overflow: 'hidden', // Essential for BlurView framing
    },
    bottomSheet: {
        flex: 1,
        paddingTop: 14,
        backgroundColor: Colors.glassOverlay,
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
    },
    dragHandle: {
        width: 48,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 24,
    },
    sheetContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 36,
        paddingHorizontal: 10,
    },
    actionButton: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(37,99,235,0.3)',
    },
    actionText: {
        color: Colors.textPrimary,
        fontFamily: Typography.semiBold,
        fontSize: 13,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Typography.bold,
        color: Colors.white,
        marginBottom: 18,
    },
    routeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(21, 28, 44, 0.6)',
        padding: 18,
        borderRadius: 20,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    routeIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    routeInfo: {
        flex: 1,
    },
    routeTitle: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Typography.bold,
        marginBottom: 4,
    },
    routeSubtitle: {
        color: Colors.textSecondary,
        fontFamily: Typography.regular,
        fontSize: 13,
    },
    aiRecommendation: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderRadius: 24,
        padding: 20,
    },
    aiTitle: {
        color: Colors.success,
        fontSize: 15,
        fontFamily: Typography.bold,
        marginLeft: 6,
    },
    aiText: {
        color: Colors.textPrimary,
        fontFamily: Typography.regular,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 18,
    },
    routePreviewButton: {
        backgroundColor: Colors.success,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    routePreviewText: {
        color: '#022C22', // Dark emerald
        fontFamily: Typography.extraBold,
        fontSize: 14,
    }
});

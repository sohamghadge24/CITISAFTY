import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { markAsRead, clearCriticalEmergency, addAlert } from '../../src/store/slices/alertsSlice';
import { Colors } from '../../src/constants/theme';
import { AlertCircle, ShieldAlert, Zap, Truck, CheckCircle2 } from 'lucide-react-native';

export default function AlertsScreen() {
    const dispatch = useDispatch();
    const alerts = useSelector((state: RootState) => (state as any).alerts.activeAlerts);
    const criticalActive = useSelector((state: RootState) => (state as any).alerts.criticalEmergencyActive);

    useEffect(() => {
        // Mock simulation of an incoming AI alert for demo
        if (alerts.length === 0) {
            setTimeout(() => {
                dispatch(addAlert({
                    id: 'mock-1',
                    type: 'AI_WARNING',
                    title: 'Accident detected 400m ahead',
                    message: 'Lane blocked. Severity HIGH. Traffic slow-down expected.',
                    severity: 'HIGH',
                    distanceAheadMs: 400,
                    timestamp: new Date().toISOString(),
                    read: false
                }));
            }, 2000);

            // Add a critical mock
            setTimeout(() => {
                dispatch(addAlert({
                    id: 'mock-2',
                    type: 'EMERGENCY_RESPONSE',
                    title: 'Emergency Response Activated',
                    message: 'Ambulance dispatched. Police notified. ETA 6 minutes.',
                    severity: 'CRITICAL',
                    timestamp: new Date().toISOString(),
                    read: false
                }));
            }, 5000);
        }
    }, []);

    const getAlertIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <ShieldAlert color={Colors.white} size={32} />;
            case 'HIGH': return <AlertCircle color={Colors.alert} size={28} />;
            case 'MEDIUM': return <AlertCircle color={'#F59E0B'} size={28} />;
            case 'LOW': return <Zap color={Colors.primary} size={28} />;
            default: return <AlertCircle color={Colors.textSecondary} size={28} />;
        }
    };

    const renderAlertItem = ({ item }: { item: any }) => {
        const isCritical = item.severity === 'CRITICAL';

        return (
            <View style={[styles.alertCard, isCritical && styles.criticalCard]}>
                <View style={styles.alertHeader}>
                    {getAlertIcon(item.severity)}
                    <View style={styles.alertHeaderTextContainer}>
                        <Text style={[styles.alertTitle, isCritical && { color: Colors.white }]}>{item.title}</Text>
                        <Text style={[styles.alertSeverity, isCritical && { color: 'rgba(255,255,255,0.8)' }]}>
                            Severity: {item.severity}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.alertMessage, isCritical && { color: Colors.white }]}>{item.message}</Text>

                {item.type === 'AI_WARNING' && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButtonOutline} onPress={() => dispatch(markAsRead(item.id))}>
                            <Text style={styles.actionButtonOutlineText}>Dismiss</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButtonPrimary}>
                            <Text style={styles.actionButtonText}>Avoid Route</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isCritical && (
                    <View style={styles.emergencyStats}>
                        <View style={styles.estItem}>
                            <Truck color={Colors.white} size={20} />
                            <Text style={styles.estText}>Ambulance en route (6m)</Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Safety Alerts</Text>
                <Text style={styles.headerSubtitle}>Real-time AI monitoring active</Text>
            </View>

            {criticalActive && (
                <View style={styles.topEmergencyBanner}>
                    <ShieldAlert color={Colors.white} size={24} style={{ marginRight: 10 }} />
                    <Text style={styles.topEmergencyText}>CRITICAL INCIDENT NEARBY</Text>
                </View>
            )}

            {alerts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <CheckCircle2 color={Colors.success} size={64} style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>All Clear</Text>
                    <Text style={styles.emptyText}>No active alerts in your area</Text>
                </View>
            ) : (
                <FlatList
                    data={alerts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAlertItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
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
        color: Colors.success,
    },
    topEmergencyBanner: {
        backgroundColor: Colors.alert,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginBottom: 16,
        marginHorizontal: 20,
        borderRadius: 12,
        shadowColor: Colors.alert,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    topEmergencyText: {
        color: Colors.white,
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
    },
    alertCard: {
        backgroundColor: Colors.cardSurface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    criticalCard: {
        backgroundColor: Colors.alert,
        borderColor: Colors.alert,
        shadowColor: Colors.alert,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    alertHeaderTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    alertTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    alertSeverity: {
        color: Colors.alert,
        fontSize: 13,
        fontWeight: '600',
    },
    alertMessage: {
        color: Colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButtonOutline: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.textSecondary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 10,
    },
    actionButtonOutlineText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    actionButtonPrimary: {
        flex: 1,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: Colors.white,
        fontWeight: '700',
    },
    emergencyStats: {
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 12,
    },
    estItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    estText: {
        color: Colors.white,
        marginLeft: 10,
        fontWeight: '600',
        fontSize: 15,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
    },
});

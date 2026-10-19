import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { Colors } from '../../src/constants/theme';
import { UserCircle2, ShieldCheck, Award, FileText, Settings, HelpCircle, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
    const user = useSelector((state: RootState) => state.user as any);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.header}>
                <UserCircle2 color={Colors.white} size={64} style={{ marginBottom: 16 }} />
                <Text style={styles.userName}>Citizen Profile</Text>
                <Text style={styles.userSubtitle}>Safe City Participant</Text>
            </View>

            {/* Trust Score Card */}
            <View style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                    <ShieldCheck color={Colors.success} size={28} />
                    <Text style={styles.scoreTitle}>Civic Trust Score</Text>
                </View>

                <View style={styles.scoreRow}>
                    <Text style={styles.scoreValue}>{user.trustScore}</Text>
                    <Text style={styles.scoreMax}>/ 1000</Text>
                </View>

                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${(user.trustScore / 1000) * 100}%` }]} />
                </View>

                <View style={styles.rankContainer}>
                    <Award color={Colors.primary} size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.rankText}>Rank: {user.communityRank}</Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <FileText color={Colors.textSecondary} size={24} style={{ marginBottom: 10 }} />
                    <Text style={styles.statNumber}>{user.reportsSubmitted}</Text>
                    <Text style={styles.statLabel}>Total Reports</Text>
                </View>

                <View style={styles.statCard}>
                    <ShieldCheck color={Colors.success} size={24} style={{ marginBottom: 10 }} />
                    <Text style={styles.statNumber}>{user.verifiedReports}</Text>
                    <Text style={styles.statLabel}>Verified Used</Text>
                </View>
            </View>

            {/* Action List */}
            <View style={styles.actionList}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <TouchableOpacity style={styles.actionRow}>
                    <View style={styles.actionLeft}>
                        <Settings color={Colors.textSecondary} size={20} />
                        <Text style={styles.actionText}>Settings & Privacy</Text>
                    </View>
                    <ChevronRight color={Colors.textSecondary} size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow}>
                    <View style={styles.actionLeft}>
                        <HelpCircle color={Colors.textSecondary} size={20} />
                        <Text style={styles.actionText}>Help & Support</Text>
                    </View>
                    <ChevronRight color={Colors.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    userName: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    userSubtitle: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    scoreCard: {
        backgroundColor: Colors.cardSurface,
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    scoreValue: {
        color: Colors.success,
        fontSize: 48,
        fontWeight: '800',
    },
    scoreMax: {
        color: Colors.textSecondary,
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 6,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.success,
        borderRadius: 4,
    },
    rankContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    rankText: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: Colors.cardSurface,
        width: '48%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statNumber: {
        color: Colors.white,
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    actionList: {
        backgroundColor: Colors.cardSurface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 16,
    },
});

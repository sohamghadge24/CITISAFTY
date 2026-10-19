export const Colors = {
    background: '#0B0F19', // Deeper luxury dark
    cardSurface: '#151C2C', // Deep blue slate
    primary: '#2563EB', // Vibrant premium blue
    primaryGlow: 'rgba(37, 99, 235, 0.4)',
    alert: '#EF4444',
    success: '#10B981', // Premium emerald green
    textPrimary: '#F1F5F9', // Crisp white/blue
    textSecondary: '#64748B', // Elegant muted grey
    white: '#FFFFFF',
    black: '#000000',
    glassOverlay: 'rgba(21, 28, 44, 0.75)', // For blur views
    glassBorder: 'rgba(255, 255, 255, 0.08)' // Subtle highlight
};

export const Shadows = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    glow: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
    }
};

export const Typography = {
    regular: 'Inter_400Regular',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Outfit_700Bold', // Great for headers
};

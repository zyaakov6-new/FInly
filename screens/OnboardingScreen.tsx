import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Dimensions,
    TouchableOpacity,
    I18nManager,
    Platform,
    StatusBar,
    Animated,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'מעקב הוצאות לעצמאים',
        description: 'קבע מחירים, עקוב הוצאות,\nוראה את הרווח שלך',
        image: require('../assets/onboarding_1.png'),
        buttonLabel: 'בואו נתחיל',
        isLast: false,
    },
    {
        id: '2',
        title: 'קבע מחיר לשירות שלך',
        description: 'הגדר כמה אתה מחייב לכל\nפרויקט או שעה',
        image: require('../assets/onboarding_2.png'),
        buttonLabel: 'הבא',
        isLast: false,
    },
    {
        id: '3',
        title: 'עקוב אחרי הוצאות בקלות',
        description: 'העלה קבלות, סווג הוצאות,\nבדוק כמה הוצאת',
        image: require('../assets/onboarding_3.png'),
        buttonLabel: 'הבא',
        isLast: false,
    },
    {
        id: '4',
        title: 'ראה את הרווח האמיתי שלך',
        description: 'P&L דוח שיצא בשנייה -\nרווח לפי פרויקט או כללי',
        image: require('../assets/onboarding_4.png'),
        buttonLabel: 'בואו נתחיל!',
        isLast: true,
    },
];

export default function OnboardingScreen() {
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Last slide action
            navigation.replace('Main');
        }
    };

    // Determine if we are in Forced RTL mode to handle direction logic
    // In forced RTL:
    // "Next" (logic next) -> visually moves LEFT (index increases)
    // Arrows: "Next" icon should probably point "Back" visually if the user thinks LTR,
    // but in RTL "Forward" is Left.
    // However, usually "Next" arrow points in the direction of flow.
    // In RTL, flow is Right -> Left. So arrow should point Left.
    // Lucide 'ArrowLeft' points Left. 'ArrowRight' points Right.
    const ArrowIcon = I18nManager.isRTL ? ArrowLeft : ArrowRight;

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <View style={styles.background} />

            <View style={{ flex: 3 }}>
                <FlatList
                    data={SLIDES}
                    renderItem={({ item }) => (
                        <View style={styles.slide}>
                            <View style={styles.iconContainer}>
                                <Image
                                    source={item.image}
                                    style={styles.illustration}
                                    resizeMode="contain"
                                />
                            </View>

                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                // In RTL mode, FlatList automatically reverses list? 
                // Usually yes, index 0 is at Right.
                />
            </View>

            <View style={styles.footer}>
                {/* Paginator */}
                <View style={styles.paginatorContainer}>
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                        // For RTL, the x offsets might be negative or inverted depending on RN version/platform
                        // but usually width based interpolation works if input is absolute scroll offset.

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 25, 10], // Expand current dot
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i.toString()}
                                style={[
                                    styles.dot,
                                    { width: dotWidth, opacity },
                                    i === currentIndex && { backgroundColor: COLORS.primary }
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            SLIDES[currentIndex].isLast && styles.buttonPrimary
                        ]}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.buttonText,
                            SLIDES[currentIndex].isLast && styles.buttonTextPrimary
                        ]}>
                            {SLIDES[currentIndex].buttonLabel}
                        </Text>

                        {/* Show arrow if not the "Let's Start" big button? Or always?
                            Request says: "Next" -> Outline, Teal Border.
                            "Let's Start" -> Solid Teal background.
                        */}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.background,
    },
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 100, // Visual adjustment
    },
    iconContainer: {
        marginBottom: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustration: {
        width: 300,
        height: 300,
    },
    title: {
        fontSize: 28,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: FONTS.bold,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: FONTS.regular,
    },
    footer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    paginatorContainer: {
        flexDirection: 'row-reverse', // Fix RTL alignment: Dot 1 (Right) -> Dot 4 (Left)
        // With index 0 (Right) active, moving to index 1 (Left) creates R->L flow ("start from right and go left")
        height: 40,
        justifyContent: 'center',
        marginTop: 20,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.textTertiary,
        marginHorizontal: 8,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
        minWidth: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        width: '100%', // Check request: "Solid teal background, full width" for Last button
    },
    buttonText: {
        fontSize: 18,
        color: COLORS.primary,
        fontFamily: FONTS.medium,
    },
    buttonTextPrimary: {
        color: COLORS.white, // Contrast on Primary
    },
});

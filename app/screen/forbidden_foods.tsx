import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { axiosClient } from '../../api/axiosClient';

const FOOD_CATEGORIES = [
    { id: 'all', label: 'All', icon: 'restaurant' },
    { id: 'protein', label: 'Protein', icon: 'barbell' },
    { id: 'carb', label: 'Carb', icon: 'leaf' },
    { id: 'fat', label: 'Fat', icon: 'water' },
    { id: 'fiber', label: 'Fiber', icon: 'nutrition' },
];

export default function ForbiddenFoodsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, isDark } = useTheme();
    
    const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Food database search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isListExpanded, setIsListExpanded] = useState(false);
    const [isSearchResultsExpanded, setIsSearchResultsExpanded] = useState(false);

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                if (params.recordId) {
                    const response = await axiosClient.get(`/api/v1/medical-records/${params.recordId}`) as any;
                    // Check both camelCase and snake_case just in case
                    const foods = response?.forbiddenFoods || response?.forbidden_foods;
                    if (foods && Array.isArray(foods)) {
                        setSelectedFoods(new Set(foods));
                    }
                    
                    // Load AI suggestions from analysis
                    if (response?.aiAnalysis) {
                        const parsed = typeof response.aiAnalysis === 'string' ? JSON.parse(response.aiAnalysis) : response.aiAnalysis;
                        const suggested = parsed.forbidden_foods || parsed.forbiddenFoods;
                        if (suggested && Array.isArray(suggested)) {
                            setAiSuggestions(suggested);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching record foods", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFoods();
        handleSearchFood("");
    }, [params.recordId]);

    const handleSearchFood = async (query: string) => {
        setSearchQuery(query);
        setIsSearching(true);
        try {
            const response = await axiosClient.get(`/api/v1/food/search?query=${encodeURIComponent(query)}`) as any;
            setSearchResults(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const toggleFoodSelection = (food: string) => {
        const next = new Set(selectedFoods);
        if (next.has(food)) next.delete(food);
        else next.add(food);
        setSelectedFoods(next);
    };

    const handleSelectAllSuggestions = () => {
        const next = new Set(selectedFoods);
        aiSuggestions.forEach(food => next.add(food));
        setSelectedFoods(next);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (params.recordId) {
                await axiosClient.put(`/api/v1/medical-records/${params.recordId}/forbidden-foods`, Array.from(selectedFoods));
            } else {
                await axiosClient.put('/api/v1/users/profile', {
                    forbidden_foods: Array.from(selectedFoods)
                });
            }
            Alert.alert("Thành công", "Đã cập nhật danh sách món ăn cấm!", [{ text: "OK", onPress: () => router.back() }]);
        } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Không thể lưu thay đổi.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredSearchResults = searchResults.filter((food: any) => {
        if (activeCategory === 'all') return true;
        if (food.category) {
            return food.category.toLowerCase().includes(activeCategory.toLowerCase());
        }
        return false; 
    });

    const displayedSearchResults = isSearchResultsExpanded ? filteredSearchResults : filteredSearchResults.slice(0, 5);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                    <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Thêm Món Ăn Cấm</Text>
                <View style={{width: 44}} />
            </View>

            {isLoading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#0ea5e9" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <Text style={[styles.desc, { color: colors.textSecondary }]}>
                        Danh sách các món ăn cần tránh cho hồ sơ khám bệnh này.
                    </Text>

                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="restaurant" size={20} color="#f43f5e" />
                            <Text style={styles.sectionTitle}>Your Restricted Foods</Text>
                        </View>

                        {selectedFoods.size > 0 ? (
                            <View>
                                <View style={[styles.foodGrid, { marginBottom: 10 }]}>
                                    {Array.from(selectedFoods).slice(0, isListExpanded ? undefined : 6).map((food, idx) => (
                                        <TouchableOpacity 
                                            key={idx} 
                                            style={[styles.foodItem, styles.foodItemSelected]}
                                            onPress={() => toggleFoodSelection(food)}
                                        >
                                            <Ionicons name="close-circle" size={18} color="#f43f5e" />
                                            <Text style={[styles.foodText, { color: "#f43f5e" }]}>
                                                {food}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {selectedFoods.size > 6 && (
                                    <TouchableOpacity 
                                        style={styles.expandToggle} 
                                        onPress={() => setIsListExpanded(!isListExpanded)}
                                    >
                                        <Text style={styles.expandToggleText}>
                                            {isListExpanded ? "Thu gọn bớt" : `Xem thêm ${selectedFoods.size - 6} món...`}
                                        </Text>
                                        <Ionicons name={isListExpanded ? "chevron-up" : "chevron-down"} size={14} color="#64748b" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <Text style={{color: '#94a3b8', fontSize: 13, marginBottom: 15}}>Bạn chưa chọn món ăn cấm nào.</Text>
                        )}

                        {aiSuggestions.length > 0 && (
                            <>
                                <View style={[styles.sectionHeaderRow, { marginTop: 15, justifyContent: 'space-between' }]}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Ionicons name="bulb-outline" size={18} color="#0ea5e9" />
                                        <Text style={[styles.searchLabel, { marginTop: 0, marginLeft: 6 }]}>Gợi ý từ AI:</Text>
                                    </View>
                                    <TouchableOpacity onPress={handleSelectAllSuggestions}>
                                        <Text style={{fontSize: 12, color: '#0ea5e9', fontWeight: 'bold'}}>Chọn tất cả</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.foodGrid, { marginBottom: 15 }]}>
                                    {aiSuggestions.map((food, idx) => {
                                        const isSelected = selectedFoods.has(food);
                                        return (
                                            <TouchableOpacity 
                                                key={`ai-${idx}`} 
                                                style={[styles.foodItem, isSelected && styles.foodItemSelected]}
                                                onPress={() => toggleFoodSelection(food)}
                                            >
                                                <Ionicons 
                                                    name={isSelected ? "checkmark-circle" : "add-circle-outline"} 
                                                    size={18} 
                                                    color={isSelected ? "#f43f5e" : "#0ea5e9"} 
                                                />
                                                <Text style={[styles.foodText, { color: isSelected ? "#f43f5e" : colors.text }]}>
                                                    {food}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </>
                        )}

                        <Text style={styles.searchLabel}>Search to add new foods:</Text>
                        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1e293b' : '#f8fafc' }]}>
                            <Ionicons name="search" size={18} color="#94a3b8" />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search foods..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={handleSearchFood}
                            />
                            {isSearching && <ActivityIndicator size="small" color="#0ea5e9" />}
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {FOOD_CATEGORIES.map(cat => {
                                const isActive = activeCategory === cat.id;
                                return (
                                    <TouchableOpacity 
                                        key={cat.id} 
                                        style={[
                                            styles.categoryChip, 
                                            isActive ? { backgroundColor: '#3b82f6', borderColor: '#3b82f6' } : { backgroundColor: isDark ? '#1e293b' : '#fff' }
                                        ]}
                                        onPress={() => setActiveCategory(cat.id)}
                                    >
                                        {isActive && <Ionicons name={cat.icon as any} size={14} color="#fff" style={{marginRight: 4}} />}
                                        <Text style={[styles.categoryText, isActive ? { color: '#fff', fontWeight: 'bold' } : { color: '#64748b' }]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {filteredSearchResults.length > 0 && (
                            <View style={styles.searchResultsBox}>
                                {displayedSearchResults.map((food: any) => (
                                    <TouchableOpacity 
                                        key={food.id || food.name} 
                                        style={styles.searchResultItem}
                                        onPress={() => {
                                            toggleFoodSelection(food.name);
                                        }}
                                    >
                                        <View>
                                            <Text style={{color: colors.text, fontWeight: '600'}}>{food.name}</Text>
                                            {food.nutritionPer100g && (
                                                <Text style={{color: '#94a3b8', fontSize: 12, marginTop: 2}}>
                                                    {food.nutritionPer100g.calories} kcal • P: {food.nutritionPer100g.proteinG}g • C: {food.nutritionPer100g.carbsG}g
                                                </Text>
                                            )}
                                        </View>
                                        <Ionicons 
                                            name={selectedFoods.has(food.name) ? "checkmark-circle" : "add-circle-outline"} 
                                            size={24} 
                                            color={selectedFoods.has(food.name) ? "#f43f5e" : "#0ea5e9"} 
                                        />
                                    </TouchableOpacity>
                                ))}
                                
                                {filteredSearchResults.length > 5 && (
                                    <TouchableOpacity 
                                        style={{ padding: 12, alignItems: 'center', backgroundColor: 'rgba(148,163,184,0.05)' }}
                                        onPress={() => setIsSearchResultsExpanded(!isSearchResultsExpanded)}
                                    >
                                        <Text style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
                                            {isSearchResultsExpanded ? 'Show less' : `Show more (${filteredSearchResults.length - 5})`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Lưu Danh Sách</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15 },
    circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(148,163,184,0.1)', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '800' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
    desc: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
    
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    sectionCard: { backgroundColor: 'rgba(148,163,184,0.05)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)' },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginLeft: 8 },
    
    foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    foodItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(148,163,184,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    foodItemSelected: { backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.4)', borderWidth: 1 },
    foodText: { marginLeft: 6, fontSize: 13, fontWeight: '600' },

    searchLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, marginTop: 5 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, paddingHorizontal: 12, marginBottom: 15 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
    searchResultsBox: { backgroundColor: 'rgba(148,163,184,0.05)', borderRadius: 12, overflow: 'hidden' },
    searchResultItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.1)' },
    
    categoryScroll: { flexDirection: 'row', marginBottom: 15 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
    categoryText: { fontSize: 13, fontWeight: '600' },
    expandToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginTop: 5 },
    expandToggleText: { fontSize: 12, color: '#64748b', fontWeight: '600', marginRight: 4 },

    saveBtn: { backgroundColor: '#10b981', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

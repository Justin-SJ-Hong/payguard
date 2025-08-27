import { useState, useEffect } from 'react';

interface UseAddressAutocompleteProps {
  query: string;
  onSelect: (address: string) => void;
}

export const useAddressAutocomplete = ({ query, onSelect }: UseAddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://brywgebfgffpiulmkmrw.supabase.co/functions/v1/places-autocomplete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ input: query }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', res.status, errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        // API 응답 구조 확인을 위한 로그
        console.log('API Response:', data);

        // API에서 반환된 prediction들의 formatted string 추출
        const results = data?.predictions?.map((item: any) => item.description) || [];
        setSuggestions(results);
      } catch (error) {
        console.error('주소 자동완성 실패:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 500); // 디바운스

    return () => clearTimeout(timer);
  }, [query, SUPABASE_ANON_KEY]);

  const handleSelect = (address: string) => {
    onSelect(address);
    setSuggestions([]);
  };

  return {
    suggestions,
    loading,
    handleSelect,
  };
};

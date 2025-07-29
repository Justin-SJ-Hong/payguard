import { useState, useEffect } from 'react';
import { TextField, List, ListItem, Paper, ListItemButton } from '@mui/material';
import { supabase } from '../lib/supabase';

interface Props {
  onSelect: (address: string) => void;
}

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function AddressAutocomplete({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
  }, [query]);

  return (
    <>
      <TextField
        label="주소"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="예: 서울 강남구"
        helperText={loading ? '검색 중...' : ''}
      />
      {suggestions.length > 0 && (
        <Paper elevation={2}>
          <List>
            {suggestions.map((address, idx) => (
                <ListItem key={idx} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setQuery(address);
                        setSuggestions([]);
                        onSelect(address);
                      }}
                    >
                        {address}
                    </ListItemButton>
                </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}

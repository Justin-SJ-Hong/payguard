import { useState } from 'react';
import { TextField, List, ListItem, Paper, ListItemButton } from '@mui/material';
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete';

interface Props {
  onSelect: (address: string) => void;
}

export default function AddressAutocomplete({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const { suggestions, loading, handleSelect } = useAddressAutocomplete({ query, onSelect });

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
                        handleSelect(address);
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

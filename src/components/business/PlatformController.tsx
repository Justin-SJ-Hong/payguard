// src/components/PlatformController.tsx
import { Autocomplete, TextField, Chip } from "@mui/material";
import { useProposalStore } from "../../store/proposalStore";

const MAX_PLATFORMS = 10;

const platformOptions = [
  "React", "Vue", "Angular", "Next.js", "Nuxt.js",
  "Node.js", "Express", "Django", "Flask", "Spring",
  "Flutter", "React Native", "Ionic", "Electron"
];

const PlatformController = () => {
  const { platforms, setPlatforms, setError, clearError, errors } = useProposalStore();

  return (
    <Autocomplete
      options={platformOptions}
      multiple
      freeSolo
      disableCloseOnSelect
      filterSelectedOptions
      limitTags={MAX_PLATFORMS}
      value={platforms || []}
      onChange={(_, newValue) => {
        if (newValue.length > MAX_PLATFORMS) {
          setError("platforms", `최대 ${MAX_PLATFORMS}개까지만 선택할 수 있습니다.`);
        } else {
          clearError("platforms");
          setPlatforms(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="계약 대상 플랫폼"
          placeholder="입력 후 Enter"
          error={!!errors.platforms}
          helperText={errors.platforms || ''}
        />
      )}
    />
  );
}

export default PlatformController;
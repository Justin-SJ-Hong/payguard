// src/components/PlatformController.tsx
import { Autocomplete, TextField, Chip } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const MAX_PLATFORMS = 10;

const platformOptions = [
  "React", "Vue", "Angular", "Next.js", "Nuxt.js",
  "Node.js", "Express", "Django", "Flask", "Spring",
  "Flutter", "React Native", "Ionic", "Electron"
];

const PlatformController = () => {
  const { control, setError, clearErrors, formState: { errors } } = useFormContext();

  return (
    <Controller
      name="platforms"
      control={control}
      defaultValue={[]}
      rules={{
        validate: (platforms) =>
          platforms.length <= MAX_PLATFORMS || `최대 ${MAX_PLATFORMS}개까지만 선택할 수 있습니다.`,
      }}
      render={({ field }) => (
        <Autocomplete
          options={platformOptions}
          multiple
          freeSolo
          disableCloseOnSelect
          filterSelectedOptions
          limitTags={MAX_PLATFORMS}
          value={field.value}
          onChange={(_, newValue) => {
            if (newValue.length > MAX_PLATFORMS) {
              setError("platforms", {
                type: "manual",
                message: `최대 ${MAX_PLATFORMS}개까지만 선택할 수 있습니다.`,
              });
            } else {
              clearErrors("platforms");
              field.onChange(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="계약 대상 플랫폼"
              placeholder="입력 후 Enter"
              error={!!errors.platforms}
              helperText={typeof errors.platforms?.message === 'string' ? errors.platforms.message : ''}
              sx={{ mb: 2 }}
            />
          )}
        />
      )}
    />
  );
}

export default PlatformController;
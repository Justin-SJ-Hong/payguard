import { Autocomplete, TextField, Chip } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const MAX_TAGS = 20;

const platformOptions = [
  "React", "Vue", "Node.js", "Figma", "Flutter",
  "Firebase", "Jira", "Slack", "Photoshop"
];

const PlatformTagsController = () => {
  const { control, setError, clearErrors, formState: { errors } } = useFormContext();

  return (
    <Controller
      name="platformTags"
      control={control}
      defaultValue={[]}
      rules={{
        validate: (tags) =>
          tags.length <= MAX_TAGS || `최대 ${MAX_TAGS}개까지만 선택할 수 있습니다.`,
      }}
      render={({ field }) => (
        <Autocomplete
          options={platformOptions}
          multiple
          freeSolo
          disableCloseOnSelect
          filterSelectedOptions
          limitTags={MAX_TAGS}
          value={field.value}
          onChange={(_, newValue) => {
            if (newValue.length > MAX_TAGS) {
              setError("platformTags", {
                type: "manual",
                message: `최대 ${MAX_TAGS}개까지만 선택할 수 있습니다.`,
              });
            } else {
              clearErrors("platformTags");
              field.onChange(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="계약 대상 플랫폼 / 도구"
              placeholder="입력 후 Enter"
              error={!!errors.platformTags}
              helperText={typeof errors.platformTags?.message === 'string' ? errors.platformTags.message : ''}
            />
          )}
        />
      )}
    />

  );
}

export default PlatformTagsController;
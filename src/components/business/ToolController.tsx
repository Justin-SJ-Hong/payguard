// src/components/ToolController.tsx
import { Autocomplete, TextField, Chip } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

const MAX_TOOLS = 10;

const toolOptions = [
  "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator",
  "Jira", "Confluence", "Slack", "Discord", "Notion",
  "GitHub", "GitLab", "Bitbucket", "Trello", "Asana",
  "Firebase", "AWS", "Google Cloud", "Vercel", "Netlify"
];

const ToolController = () => {
  const { control, setError, clearErrors, formState: { errors } } = useFormContext();

  return (
    <Controller
      name="tools"
      control={control}
      defaultValue={[]}
      rules={{
        validate: (tools) =>
          tools.length <= MAX_TOOLS || `최대 ${MAX_TOOLS}개까지만 선택할 수 있습니다.`,
      }}
      render={({ field }) => (
        <Autocomplete
          options={toolOptions}
          multiple
          freeSolo
          disableCloseOnSelect
          filterSelectedOptions
          limitTags={MAX_TOOLS}
          value={field.value}
          onChange={(_, newValue) => {
            if (newValue.length > MAX_TOOLS) {
              setError("tools", {
                type: "manual",
                message: `최대 ${MAX_TOOLS}개까지만 선택할 수 있습니다.`,
              });
            } else {
              clearErrors("tools");
              field.onChange(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="계약 대상 도구"
              placeholder="입력 후 Enter"
              error={!!errors.tools}
              helperText={typeof errors.tools?.message === 'string' ? errors.tools.message : ''}
            />
          )}
        />
      )}
    />
  );
}

export default ToolController;
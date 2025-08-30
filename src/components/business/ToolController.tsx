// src/components/ToolController.tsx
import { Autocomplete, TextField, Chip } from "@mui/material";
import { useProposalStore } from "../../store/proposalStore";

const MAX_TOOLS = 10;

const toolOptions = [
  "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator",
  "Jira", "Confluence", "Slack", "Discord", "Notion",
  "GitHub", "GitLab", "Bitbucket", "Trello", "Asana",
  "Firebase", "AWS", "Google Cloud", "Vercel", "Netlify"
];

const ToolController = () => {
  const { tools, setTools, setError, clearError, errors } = useProposalStore();

  return (
    <Autocomplete
      options={toolOptions}
      multiple
      freeSolo
      disableCloseOnSelect
      filterSelectedOptions
      limitTags={MAX_TOOLS}
      value={tools || []}
      onChange={(_, newValue) => {
        if (newValue.length > MAX_TOOLS) {
          setError("tools", `최대 ${MAX_TOOLS}개까지만 선택할 수 있습니다.`);
        } else {
          clearError("tools");
          setTools(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="계약 대상 도구"
          placeholder="입력 후 Enter"
          error={!!errors.tools}
          helperText={errors.tools || ''}
        />
      )}
    />
  );
}

export default ToolController;
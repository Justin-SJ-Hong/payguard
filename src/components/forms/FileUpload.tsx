import React from "react";
import { Box, Button, Typography, IconButton, List, ListItem, ListItemText } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useProposalStore } from "../../store/proposalStore";

const MAX_FILES = 5;
const ACCEPTED_TYPES = [
    "image/png", 
    "image/jpeg", 
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentatio",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet"
];

export const FileUpload = () => {
    const { attachments, setAttachments, setError, clearError } = useProposalStore();
    const files: File[] = attachments || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // 1. 파일 형식 제한
        if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        setError("attachments", "지원되지 않는 파일 형식입니다.");
        return;
        }

        // 2. 동일한 파일 이름 중복 방지
        const isDuplicate = files.some(file => 
            file.name === selectedFile.name &&
            file.size === selectedFile.size &&
            file.lastModified === selectedFile.lastModified
        );
        if (isDuplicate) {
            setError("attachments", "같은 이름의 파일이 이미 첨부되었습니다.");
            return;
        }

        // 3. 최대 개수 제한
        if (files.length >= MAX_FILES) {
        setError("attachments", `최대 ${MAX_FILES}개까지 첨부할 수 있습니다.`);
        return;
        }

        // 4. 성공 시 추가
        clearError("attachments");
        setAttachments([...files, selectedFile]);
        e.target.value = ""; // 동일한 파일 선택 시에도 이벤트 발생하게 초기화
    };

    const handleFileDelete = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setAttachments(updatedFiles);
        if (updatedFiles.length < MAX_FILES) clearError("attachments");
    };

    return (
        <>
            <Typography>
                최대 {MAX_FILES}개까지 첨부 가능합니다!!
            </Typography>
            <Box>
                <Button component="label" variant="contained" sx={{ mb: 2 }}>
                    파일 첨부
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>

                <List dense>
                    {files.map((file, index) => (
                    <ListItem
                        key={index}
                        secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleFileDelete(index)}>
                            <DeleteIcon />
                        </IconButton>
                        }
                    >
                        <ListItemText
                        primary={file.name}
                        secondary={`(${(file.size / 1024).toFixed(1)} KB)`}
                        />
                    </ListItem>
                    ))}
                </List>

                {files.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                    총 {files.length}개 첨부됨
                    </Typography>
                )}
            </Box>
        </>
    );
};

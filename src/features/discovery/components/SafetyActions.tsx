import React from 'react';
import { ReportDialog, BlockDialog } from './UserActions';

interface SafetyActionsProps {
    showReport: boolean;
    setShowReport: (open: boolean) => void;
    showBlock: boolean;
    setShowBlock: (open: boolean) => void;
    targetId: string;
    targetName: string;
    onSuccess?: () => void;
}

export const SafetyActions: React.FC<SafetyActionsProps> = ({
    showReport,
    setShowReport,
    showBlock,
    setShowBlock,
    targetId,
    targetName,
    onSuccess
}) => {
    return (
        <>
            <ReportDialog
                open={showReport}
                onOpenChange={setShowReport}
                userId={targetId}
                userName={targetName}
                onReported={onSuccess}
            />
            <BlockDialog
                open={showBlock}
                onOpenChange={setShowBlock}
                userId={targetId}
                userName={targetName}
                onBlocked={onSuccess}
            />
        </>
    );
};

import { Trans, useTranslation } from "react-i18next";

interface EmailSuggestionHintProps {
    suggestion: string;
    onAccept: (email: string) => void;
}

export function EmailSuggestionHint({ suggestion, onAccept }: EmailSuggestionHintProps) {
    const { t } = useTranslation("auth");

    return (
        <p className="text-sm text-amber-600 mt-1">
            <Trans
                t={t}
                i18nKey="auth_page.email_typo_suggestion"
                values={{ suggestion }}
                components={{
                    corrected: (
                        <button
                            type="button"
                            onClick={() => onAccept(suggestion)}
                            className="font-semibold underline hover:text-amber-700"
                        />
                    ),
                }}
            />
        </p>
    );
}

import React from "react";
import SiteBuilderCanvas from "./SiteBuilderCanvas";
import { SitePageContent } from "../types";

interface SiteBuilderRendererProps {
    content: SitePageContent;
    resolvedBindings: Record<string, Record<string, any>>;
}

/** Renders a published SitePageContent to the public, no-auth surface. */
const SiteBuilderRenderer: React.FC<SiteBuilderRendererProps> = ({ content, resolvedBindings }) => (
    <SiteBuilderCanvas sections={content.sections || []} mode="public" resolvedBindings={resolvedBindings} />
);

export default SiteBuilderRenderer;

import { usePageContext } from 'vike-react/usePageContext';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import WebsiteFooter from '@/components/shared/WebsiteFooter';
import SitePageRoute from '@/features/site-builder/components/SitePageRoute';

const BusinessSiteSlugPage = () => {
    const pageContext = usePageContext();
    const { id, slug } = pageContext.routeParams ?? {};

    return (
        <div className="min-h-screen bg-background">
            <PublicFeedHeader />
            <SitePageRoute businessId={id} slug={slug} />
            <WebsiteFooter />
        </div>
    );
};

export default BusinessSiteSlugPage;

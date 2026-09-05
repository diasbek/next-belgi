import { SITE_CONFIG } from "@/utils/consts";

export function SiteAnalytics() {
  const ym = SITE_CONFIG.analytics.yandexMetrikaId;
  const ga = SITE_CONFIG.analytics.googleAnalyticsId;
  const gtm = SITE_CONFIG.analytics.googleTagManagerId;

  if (!ym && !ga && !gtm) return null;

  return (
    <>
      {gtm ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`,
          }}
        />
      ) : null}
      {ga ? (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`,
            }}
          />
        </>
      ) : null}
      {ym ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${ym},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`,
          }}
        />
      ) : null}
    </>
  );
}

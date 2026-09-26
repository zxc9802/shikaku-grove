const printButton=document.querySelector('[data-print]');
if(printButton)printButton.addEventListener('click',()=>window.print());
// Only an explicitly configured analytics property is loaded, after consent.
const measurement=document.querySelector('meta[name="ga-measurement-id"]')?.content;
const consent=document.getElementById('analytics-consent');
function enableAnalytics(){
 if(!measurement||document.getElementById('ga-script'))return;
 window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());window.gtag('config',measurement,{allow_google_signals:false,allow_ad_personalization_signals:false});
 const s=document.createElement('script');s.id='ga-script';s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(measurement);document.head.append(s);
}
let choice;try{choice=localStorage.getItem('sg:analytics');}catch{}
if(measurement&&choice==='yes')enableAnalytics();
if(measurement&&!choice&&consent)consent.hidden=false;
document.querySelectorAll('[data-analytics-choice]').forEach(button=>button.addEventListener('click',()=>{
 const value=button.dataset.analyticsChoice;try{localStorage.setItem('sg:analytics',value);}catch{}
 consent.hidden=true;if(value==='yes')enableAnalytics();else location.reload();
}));
document.querySelector('[data-privacy-settings]')?.addEventListener('click',()=>{if(consent)consent.hidden=false;});

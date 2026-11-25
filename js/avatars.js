/* Afsoon Games – shared player avatars (15 famous Iranians), used by the card games.
   Your own avatar is the one you picked in Chahar Barg (saved as "afsoon-avatar"). */
(function(){
  const AV=[
    {id:'hafez',n:'Hafez',fa:'حافظ',f:'Mohammad_Shams_al-Din_Hafez.jpg'},
    {id:'ferdowsi',n:'Ferdowsi',fa:'فردوسی'},
    {id:'khayyam',n:'Khayyam',fa:'خیام',f:'Omar_Khayyam,_Sayr_mulhimah_min_al-Sharq_wa-al-Gharb.png'},
    {id:'molavi',n:'Molavi',fa:'مولوی',f:'Mevlana-celaleddin-i-rumi-1.jpg'},
    {id:'ibnsina',n:'Ibn Sina',fa:'ابن‌سینا',f:'Avicenna-miniatur.jpg'},
    {id:'razi',n:'Razi',fa:'رازی',f:'Portrait_of_Rhazes_(al-Razi)_(AD_865_-_925)_Wellcome_L0005053_(cropped).jpg'},
    {id:'mirzakhani',n:'Mirzakhani',fa:'میرزاخانی',f:'Maryam_Mirzakhani_in_Seoul_2014.jpg'},
    {id:'naderi',n:'Naderi',fa:'نادری',f:'Naderi_2012_JPL.jpg'},
    {id:'parvin',n:'Parvin',fa:'پروین',f:"Parvin_E'tesami.jpg"},
    {id:'naghshineh',n:'Naghshineh',fa:'نقشینه'},
    {id:'kamalolmolk',n:'Kamal-ol-molk',fa:'کمال‌الملک',f:'Kamal-ol-molk-1.jpg'},
    {id:'mosaddegh',n:'Mosaddegh',fa:'مصدق',f:'Mohammad_Mosaddegh_portrait.jpg'},
    {id:'etemadzadeh',n:'Etemadzadeh',fa:'اعتمادزاده'},
    {id:'fanizadeh',n:'Fanizadeh',fa:'فنی‌زاده'},
    {id:'fomani',n:'Fomani',fa:'فومنی'}];
  const get=id=>AV.find(a=>a.id===id)||AV[0];
  const src=a=>a.f?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(a.f)+'?width=320':'';
  function mine(){
    try{const v=localStorage.getItem('afsoon-avatar');if(v&&AV.some(a=>a.id===v))return v;
      const cb=JSON.parse(localStorage.getItem('afsoon-chaharbarg')||'null');if(cb&&cb.av&&AV.some(a=>a.id===cb.av))return cb.av}catch(e){}
    return 'hafez'}
  /* the inside of an avatar circle: first letter, with the portrait on top when there is one */
  function inner(id){const a=get(id);return a.n.replace(/[^A-Za-z]/g,'').charAt(0)+(a.f?`<img src="${src(a)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:'')}
  /* n different avatars for the computer players, never the same as yours */
  function pick(n){const me=mine();return AV.filter(a=>a.id!==me).sort(()=>Math.random()-.5).slice(0,n)}
  window.AfsAv={list:AV,get,src,mine,inner,pick};
})();

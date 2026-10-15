(()=>{
'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data,day='15',mode='high',selected=null;const localImages=new Map();
const grid=document.getElementById('story-grid'),dialog=document.getElementById('detail');
const toast=text=>{const n=document.getElementById('toast');n.textContent=text;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2200)};
const copyText=s=>mode==='low'&&s.low?s.low:mode==='none'&&s.none?s.none:s.copy;
function slot(s,label,sub='',cls=''){const existing=localImages.get(s.id);if(existing?.length){const n=existing.shift();existing.push(n);return `<div class="slot local-image"><img src="${n}" alt="この端末で仮置きした素材"></div>`}return `<div class="slot ${cls}">${esc(label)}${sub?`<small>${esc(sub)}</small>`:''}</div>`}
function evidence(s){
const k=s.evidence;if(k==='none')return '';
if(['reactions','attendance','live-reaction','question'].includes(k)){
if(mode==='none')return k==='question'?'':slot(s,'実際の準備・配信画面','反応の代わりに進行中の実物を見せる');
if(mode==='low'||k==='question')return slot(s,k==='attendance'?'参加表明の原文がある場合だけ':'本物の質問・感想を1件','読める大きさで切り出し','big');
if(k==='live-reaction')return slot(s,'当日の感想＋配信画面','その時点の実物','big');
return '<div class="evidence-grid six">'+['実際の返信①','実際の返信②','実際の返信③','投票の実結果','参加表明の原文','集計時点の実数'].map(x=>slot(s,x,'存在する素材だけ')).join('')+'</div><div class="proof-note">多数の反響がある場合の配置見本</div>';
}
if(k==='results')return '<div class="evidence-grid">'+['実績A｜対象・期間','実績B｜対象・期間','実績C｜対象・期間','本人の原文報告'].map(x=>slot(s,x,'実物に差し替え')).join('')+'</div>';
if(k==='result')return slot(s,'成果を1件、大きく','実際の投稿＋インサイト','big');
if(k==='beforeafter')return slot(s,'同じ案件の入力画面','実際に渡した素材・指示')+'<div class="arrow">↓</div>'+slot(s,'出力・修正後の実物','変わった箇所を1点だけ強調');
if(k==='ai'||k==='ai-detail')return slot(s,'実際のAI画面・出力','確認できた担当範囲を示す','big');
if(k==='workflow'||k==='triple')return '<div class="evidence-grid">'+slot(s,'企画・台本の実画面','対象が分かる切り出し')+slot(s,'分析・改善の実画面','実際に使ったもの')+'</div>';
if(k==='failure')return slot(s,'実際に外した投稿・施策','結果と見直しのメモ','big');
if(k==='schedule')return '<div class="schedule"><div>12:00　スタート</div><div>［確定時刻］［確定テーマ］</div><div>14〜15時ごろ　みさをさん出演予定</div><div>［確定時刻］［確定テーマ］</div><div>18:00　終了</div></div>';
if(k==='prep')return slot(s,'当日の準備写真・動画','過去写真を当日の実況にしない','big');
if(k==='live')return slot(s,'その時点のライブ画面','実際の進行に合わせる','big');return '';
}
function phone(s){let body=`<p class="post-copy">${esc(copyText(s))}</p>`;
if(['announce','last'].includes(s.design))body+='<div class="event-date">10/18 <small>日</small></div><div class="event-time">12:00–18:00</div><div class="event-meta">YouTubeライブ・無料／途中参加OK</div>';
body+=evidence(s);
if(s.poll)body+='<div class="poll">'+s.poll.map(x=>`<button type="button" aria-pressed="false">${esc(x)}</button>`).join('')+'<small>アンケート配置見本／送信なし</small></div>';
if(['link','last'].includes(s.design))body+='<div class="link-sticker">↗ 時間割・視聴URLの案内</div>';
if(['today','liveprep','onair'].includes(s.design))body+='<div class="link-sticker">↗ YouTubeライブを見る</div>';
const list=data.slides.filter(x=>x.day===s.day);
return `<div class="phone ${esc(s.design)}"><div class="bg" style="background-image:url('assets/${s.photo}.jpg')"></div><div class="shade"></div><div class="ig-bars">${list.map(x=>`<i class="${x.number<=s.number?'on':''}"></i>`).join('')}</div><div class="ig-user"><b>S</b> saki <small>確認用ラフ</small></div><div class="post">${body}</div><div class="ig-bottom">メッセージを送信… <span>♡</span></div></div>`;
}
function render(){const info=data.days[day];document.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.day===day)));document.getElementById('day-title').textContent=`${info.label}｜${info.date} · ${info.count}枚`;document.getElementById('day-goal').textContent=info.goal;document.getElementById('day-rule').textContent=info.rule;
grid.innerHTML=data.slides.filter(s=>s.day===day).map(s=>`<article class="story-card" id="card-${s.id}"><div class="card-heading"><b>${s.number}枚目</b><span>${esc(s.session)}</span></div>${phone(s)}<div class="card-caption"><h4 class="card-title">${esc(s.title)}</h4><p class="emotion">${esc(s.before)} → ${esc(s.after)}</p><p class="next">次を見る理由：${esc(s.next)}</p><div class="card-actions"><button type="button" data-detail="${s.id}">制作詳細・素材</button><button type="button" data-copy="${s.id}">文面コピー</button></div></div></article>`).join('');
}
const layout=s=>s.design==='hook'?'夜景写真を全面。顔の上の空に2行。白い太字。日時・説明・リンクは載せない。':s.evidence==='results'?'実績3〜4点を2×2で配置。全部を読ませず、見てほしい数値だけを囲む。':s.evidence==='beforeafter'?'同じ案件の入力→出力を上下に。変わった所は1点だけ強調。':s.poll?'問いは上部、ネイティブ投票スタンプは中〜下部。操作領域を空ける。':'上部に短い地の文、中央に実物。引用は白い面、強調は一点。本人の顔と体を避ける。';
function openDetail(id){selected=data.slides.find(x=>x.id===id);if(!selected)return;const s=selected;document.getElementById('detail-content').innerHTML=`<div class="detail-layout"><div>${phone(s)}</div><div class="detail-info"><span class="section-no">10/${s.day} · ${s.number}枚目 · ${esc(s.session)}</span><h2>${esc(s.title)}</h2><pre>10/${s.day}　${esc(s.title.slice(0,20))}</pre><pre>${esc(copyText(s))}</pre><button type="button" data-copy="${s.id}">この文面をコピー</button><h3>制作指示</h3><dl><dt>背景</dt><dd>${s.photo==='night'?'さきの夜景写真（night.jpg）':'さきのPC写真（laptop.jpg）'}。顔・体を避けて使用。</dd><dt>配置</dt><dd>${esc(layout(s))}</dd><dt>入れる素材</dt><dd>${esc(s.material)}</dd><dt>公開前の条件</dt><dd>${esc(s.gate)}</dd><dt>次への引き</dt><dd>${esc(s.next)}</dd><dt>競合から借りる構造</dt><dd>${esc(s.why)}</dd></dl><h3>実物を当てはめて確認</h3><div class="upload-zone">スクショを選ぶと、この端末の画面だけで仮置きできます。画像はアップロード・保存されません。<input id="local-upload" type="file" accept="image/*" multiple aria-label="スクショを仮置き"><button type="button" id="clear-images">仮置きを解除</button></div><h3>未確定部分の扱い</h3><p class="subtle">［ ］と実績・反響の枠は実物に置換。埋まらない場合は枚を省くか、反響の状態を切り替えます。ネイティブの投票・リンクはInstagramで設置します。</p><p class="ref-tags">参考：${s.ref.map(esc).join(' / ')}　対応：${s.n1.map(esc).join(' / ')}</p></div></div>`;if(!dialog.open)dialog.showModal();
document.getElementById('local-upload').addEventListener('change',async e=>{const files=[...e.target.files].slice(0,6);const imgs=await Promise.all(files.map(f=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)})));localImages.set(s.id,imgs);render();openDetail(s.id);toast('この端末のプレビューに仮置きしました')});document.getElementById('clear-images').addEventListener('click',()=>{localImages.delete(s.id);render();openDetail(s.id)});
}
async function copy(s){const text=`10/${s.day}　${s.title.slice(0,20)}\n\n${copyText(s)}${s.poll?'\n\n【アンケート】\n'+s.poll.join('\n'):''}`;try{await navigator.clipboard.writeText(text);toast('文面をコピーしました')}catch{toast('コピーできません。制作詳細の文面を選択してください')}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.day){day=b.dataset.day;render()}else if(b.dataset.detail)openDetail(b.dataset.detail);else if(b.dataset.copy)copy(data.slides.find(x=>x.id===b.dataset.copy));else if(b.closest('.poll')){const p=b.closest('.poll');p.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));p.querySelector('small').textContent='見本：'+b.textContent+'（送信なし）'}});
document.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
document.getElementById('reaction').addEventListener('change',e=>{mode=e.target.value;render()});document.getElementById('print').addEventListener('click',()=>window.print());
document.getElementById('copy-day').addEventListener('click',async()=>{const t=data.slides.filter(x=>x.day===day).map(s=>`10/${s.day}　${s.title.slice(0,20)}\n\n${copyText(s)}${s.poll?'\n【アンケート】'+s.poll.join('／'):''}`).join('\n\n----------------\n\n');try{await navigator.clipboard.writeText(t);toast('この日の台本をコピーしました')}catch{toast('コピーできません。各枚の制作詳細から選択してください')}});
fetch('storyboard.json').then(r=>{if(!r.ok)throw Error('data');return r.json()}).then(d=>{data=d;document.querySelector('.day-overview').innerHTML=Object.entries(d.days).map(([k,v])=>`<a class="overview-day" href="#board" data-overview="${k}"><small>${v.label} · ${v.date}</small><div class="count">${v.count}<span>枚</span></div><p>${esc(v.goal)}</p></a>`).join('');document.querySelectorAll('[data-overview]').forEach(a=>a.addEventListener('click',()=>{day=a.dataset.overview;render()}));document.querySelector('.day-tabs').innerHTML=Object.entries(d.days).map(([k,v])=>`<button type="button" data-day="${k}">${v.label} · ${v.date}</button>`).join('');document.getElementById('persona-grid').innerHTML=d.personas.map(p=>`<details><summary>${p.id}｜${esc(p.name)}</summary><p>${esc(p.scene)}</p><p>口癖：${esc(p.voice)}<br>参加しない理由：${esc(p.no)}</p><p><b>感情の流れ</b><br>${esc(p.route)}</p></details>`).join('');render()}).catch(()=>{grid.innerHTML='<p>内容を読み込めませんでした。ページを再読み込みしてください。</p>'});
})();

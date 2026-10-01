import json,sys,os
P=[
('Ogbe','opening, clarity and expansion','visibility and a clean opportunity','overconfidence or haste','move openly and use the opportunity with discipline'),
('Oyeku','closure, hidden matters and deep transition','protection and completion','fear, secrecy or forcing an ending','finish what is unfinished and protect what remains hidden'),
('Iwori','inquiry, inward examination and discovery','careful investigation and intelligence','suspicion or acting before facts are complete','verify the details and ask the second question'),
('Odi','boundaries, containment and guarded stability','structure and protection','restriction, stubbornness or isolation','strengthen boundaries without closing every door'),
('Irosun','lineage, reputation, emotion and remembered consequences','support from history and memory','old issues, gossip or repeated patterns','protect your name and correct the repeating pattern'),
('Owonrin','movement, reversal and unstable change','adaptability and escape from stagnation','sudden reversal or unreliable promises','keep a second plan and stay flexible'),
('Obara','speech, negotiation and social influence','persuasion and agreement','careless words or oversharing','speak deliberately and make agreements clear'),
('Okanran','heat, urgency, friction and decisive pressure','courage to confront a problem','anger, impulsive action or quarrel','cool the situation before deciding'),
('Ogunda','work, struggle, cutting through and earned victory','strength and practical effort','force, fatigue or unnecessary battle','remove the real obstruction and do the hard work'),
('Osa','transformation, unseen influence and sudden shifts','deep change and sensitivity','instability, fear or dramatic reaction','stabilize yourself and observe what is actually changing'),
('Ika','opposition, complexity and careful survival','alertness and strategic patience','intrigue, mistrust or escalation','reduce exposure and choose allies carefully'),
('Oturupon','correction, accountability and rebuilding','repair and moral clarity','repeating an error or refusing correction','correct the sequence and rebuild properly'),
('Otura','wisdom, planning, counsel and uplift','strategy, learning and sound guidance','plans without execution or ignored advice','choose the sensible path and execute the plan'),
('Irete','persistence, order and gradual consolidation','endurance and patient building','delay, frustration or abandoning a sound process','continue the sound process and measure progress properly'),
('Ose','attraction, diplomacy, sweetness and prosperity','favour, relationship and support','flattery, indulgence or appearances without substance','use diplomacy but secure the substance'),
('Ofun','completion, maturity, blessing and consequence','fulfilment and senior wisdom','excess, pride or overextension','finish properly and protect the result from excess')]
TOPICS={
'general':('the overall matter','clarity, discipline and correct timing','confusion, excess or poor timing','reduce the matter to the next concrete decision'),
'money':('money and financial stability','clear value, controlled spending and sound terms','hidden costs, risky promises or debt pressure','verify the numbers and protect cash flow'),
'work':('work, business or career','competence, visible value and clear agreements','unclear roles, rivalry or burnout','define the objective and do the highest-value practical work first'),
'love':('love and relationship','reciprocity, honesty and emotional steadiness','mixed signals, pride or old resentment','judge behaviour, speak clearly and protect mutual respect'),
'family':('family and household','responsibility, respect and wise use of shared history','old grievances, gossip or taking sides too quickly','address the actual issue and lower the emotional heat'),
'travel':('travel or movement','verified arrangements, preparation and flexible timing','rushed planning, unstable transport or missing information','confirm documents, timing and contingency plans'),
'conflict':('conflict or opposition','evidence, restraint, boundaries and strategic allies','anger, public escalation or hidden rivalry','document facts and use the least destructive effective action'),
'spiritual':('the spiritual matter','disciplined observance, clean conduct and careful reflection','fear, obsession with hidden enemies or neglect of practical causes','follow a sound lineage process and separate fear from evidence'),
'health':('health and wellbeing','rest, timely assessment and consistent care','delay in seeking care, self-diagnosis or stopping treatment','use this only for reflection and seek qualified clinical care')}
T=[
('The cast places {rn} in front and {ln} underneath. For {subject}, the visible force is {rcore}, while the condition underneath is {lcore}. The opening comes through {rgift}; the caution is {lrisk}.','What helps most is {support}. {rn} strengthens this by bringing {rgift}.','The main obstruction is {block}. {ln} makes the warning more specific: avoid {lrisk}.','Your controlled next move is to {step}; in the language of the pair, also {raction} and {laction}.'),
('In this combination, {rn} describes what is trying to happen now and {ln} describes what can alter the result later. On {subject}, the first leg points to {rcore}; the second leg adds {lcore}. Do not read one without the other.','The favourable side is built by {support}. The strongest usable quality in the cast is {rgift}.','The pressure point is {block}, especially where it connects with {lrisk}.','Proceed by choosing one practical action: {step}. Keep the first leg active by remembering to {raction}.'),
('This is a layered sign rather than a one-line answer. {rn} makes {rcore} the immediate issue; {ln} says the deeper condition is {lcore}. For {subject}, the result improves when the first leg is used constructively and the second leg warning is controlled.','Support comes from {support}, together with {rgift}.','The result weakens through {block}, or when {lrisk} is allowed to dominate.','The cast favours disciplined sequencing: {step}; then {laction}.'),
('The right leg, {rn}, carries the public face of the matter. The left leg, {ln}, carries the hidden cost or support. In this {subject} question, {rcore} is the immediate instruction, but {lcore} explains why the outcome may not be simple.','Strengthen {support}. The practical advantage shown by {rn} is {rgift}.','Protect yourself from {block}. {ln} warns particularly about {lrisk}.','Do not try to solve everything at once. First {step}; then {raction}.')]
entries={};count=0
for ri,r in enumerate(P,1):
 for li,l in enumerate(P,1):
  num=(ri-1)*16+li; td={}
  for topic,(subject,support,block,step) in TOPICS.items():
   arr=[]
   for v,tpl in enumerate(T):
    kw=dict(rn=r[0],ln=l[0],rcore=r[1],lcore=l[1],rgift=r[2],lgift=l[2],rrisk=r[3],lrisk=l[3],raction=r[4],laction=l[4],subject=subject,support=support,block=block,step=step)
    deep=(f'Interpretive note {v+1}: {r[0]} contributes {r[1]}; {l[0]} contributes {l[1]}. For {subject}, hold both together. The constructive side of the first leg is {r[2]}, while the second leg asks you to manage {l[3]}. This software reading emphasizes disciplined choice rather than certainty: {r[4]}; then {l[4]}. Where another person, institution or changing external condition is involved, confirm facts outside the divination before an irreversible decision.')
    arr.append({'main':tpl[0].format(**kw),'support':tpl[1].format(**kw),'block':tpl[2].format(**kw),'action':tpl[3].format(**kw),'deep':deep,'supportTitle':f'What strengthens {subject}','blockTitle':f'What weakens {subject}','actionTitle':'The next controlled move'})
    count+=1
   td[topic]=arr
  entries[str(num)]=td
payload={'version':'2.0-expanded','count':count,'entries':entries}
out=sys.argv[1] if len(sys.argv)>1 else 'knowledge.generated.js'
with open(out,'w',encoding='utf-8') as f:
 f.write('window.OPELE_EXPANDED=');json.dump(payload,f,ensure_ascii=False,separators=(',',':'));f.write(';')
print(out,os.path.getsize(out),'bytes',count,'variants')

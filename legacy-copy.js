/* Additional preview labels. */
(()=>{const rows={
'legacy.notice':['Some retained page details are still being translated. Original menus remain in their published language.','इस पृष्ठ की कुछ जानकारी का अनुवाद अभी जारी है। मूल मेन्यू अपनी प्रकाशित भाषा में हैं।','இந்தப் பக்கத்தின் சில விவரங்கள் இன்னும் மொழிபெயர்க்கப்படுகின்றன. அசல் மெனுக்கள் அவை வெளியிடப்பட்ட மொழியிலேயே உள்ளன.','Sebagian detail halaman ini masih diterjemahkan. Menu asli tetap dalam bahasa terbitannya.','รายละเอียดบางส่วนของหน้านี้ยังอยู่ระหว่างการแปล เมนูต้นฉบับยังคงเป็นภาษาที่เผยแพร่'],
'legacy.general':['General enquiries & feedback','सामान्य पूछताछ और सुझाव','பொதுவான விசாரணைகள் மற்றும் கருத்துகள்','Pertanyaan umum & masukan','สอบถามทั่วไปและความคิดเห็น'],
'legacy.visit':['Your visit, made simple.','अपनी यात्रा आसान बनाएं।','உங்கள் வருகையை எளிதாக்குவோம்.','Kunjungan Anda, lebih mudah.','วางแผนการมาเยือนได้ง่ายขึ้น'],
'legacy.deck.ubud':['Indian flavours. A little Ubud magic.','भारतीय स्वाद। उबुद का खास आकर्षण।','இந்தியச் சுவைகள். உபுடின் தனி அழகு.','Cita rasa India. Pesona khas Ubud.','รสชาติอินเดียกับเสน่ห์ของอูบุด'],
'legacy.deck.seminyak':['Dinner first. Bollywood after.','पहले भोजन। फिर बॉलीवुड।','முதலில் விருந்து. பிறகு பாலிவுட்.','Makan malam dahulu. Bollywood sesudahnya.','เริ่มด้วยมื้อค่ำ แล้วต่อด้วยบอลลีวูด'],
'legacy.deck.nusapenida':['Your island stop for Indian food.','द्वीप पर आपका भारतीय भोजन का ठिकाना।','தீவில் இந்திய உணவுக்கான உங்கள் இடம்.','Persinggahan kuliner India di pulau.','แวะเติมความอร่อยด้วยอาหารอินเดียบนเกาะ'],
'legacy.deck.phuket':['A taste of India in Old Town.','ओल्ड टाउन में भारत का स्वाद।','பழைய நகரில் இந்தியாவின் சுவை.','Cita rasa India di Old Town.','สัมผัสรสชาติอินเดียในย่านเมืองเก่า'],
'legacy.menu':['View menu','मेन्यू देखें','மெனுவைப் பாருங்கள்','Lihat menu','ดูเมนู'],
'legacy.reserve':['Reserve your table','अपनी मेज़ आरक्षित करें','உங்கள் மேசையை முன்பதிவு செய்யுங்கள்','Pesan meja Anda','จองโต๊ะของคุณ'],
'legacy.team':['Speak to the team','हमारी टीम से बात करें','எங்கள் குழுவுடன் பேசுங்கள்','Hubungi tim kami','ติดต่อทีมงาน']
};['en','hi','ta','id','th'].forEach((language,i)=>{window.BW_COPY[language]??={};for(const [key,values]of Object.entries(rows))window.BW_COPY[language][key]=values[i];});})();

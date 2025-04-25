// src/data/mockData.js
export const MOCK_ROOMS = [
    {
      id: '1',
      title: 'Teknoloji Dünyasındaki Son Gelişmeler',
      description: 'Bu odada teknoloji dünyasındaki son gelişmeleri, yeni çıkan ürünleri ve geleceğe dair beklentileri konuşuyoruz.',
      hosts: [
        { id: '1', name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', name: 'Ayşe Kaya', avatar: 'https://i.pravatar.cc/150?img=2' }
      ],
      participants: 342,
      topics: ['Teknoloji', 'Yapay Zeka', 'Mobil'],
      isLive: true,
      messages: [
        { id: '1', userId: '1', text: 'Herkese merhaba! Bugün yapay zeka alanındaki son gelişmeleri konuşacağız.', timestamp: '2023-11-10T14:00:00Z' },
        { id: '2', userId: '2', text: 'Özellikle GPT-4 ve yeni dil modelleri hakkında bilgi verebilir miyiz?', timestamp: '2023-11-10T14:01:00Z' },
        // Daha fazla mesaj eklenebilir
      ]
    },
    {
      id: '2',
      title: 'Müzik Sektöründe Yeni Trendler',
      description: 'Dijital müzik platformları, bağımsız sanatçılar ve müzik endüstrisinin geleceği üzerine sohbetler.',
      hosts: [
        { id: '3', name: 'Mehmet Demir', avatar: 'https://i.pravatar.cc/150?img=3' }
      ],
      participants: 128,
      topics: ['Müzik', 'Sanat'],
      isLive: true,
      messages: [
        { id: '1', userId: '3', text: 'Bugün dijital müzik platformlarının bağımsız sanatçılara etkilerini konuşacağız.', timestamp: '2023-11-10T15:30:00Z' },
        // Daha fazla mesaj eklenebilir
      ]
    },
    {
      id: '3',
      title: 'Girişimcilik Hikayeleri',
      description: 'Başarılı girişimcilerin hikayeleri, başarısızlıktan ders çıkarma ve startup dünyasındaki deneyimler.',
      hosts: [
        { id: '4', name: 'Zeynep Öztürk', avatar: 'https://i.pravatar.cc/150?img=4' },
        { id: '5', name: 'Can Yiğit', avatar: 'https://i.pravatar.cc/150?img=5' }
      ],
      participants: 256,
      topics: ['İş Dünyası', 'Girişimcilik', 'Finans'],
      isLive: true,
      messages: [
        { id: '1', userId: '4', text: 'Hoş geldiniz! Bugün başarısızlıktan nasıl ders çıkarılır konusunu ele alacağız.', timestamp: '2023-11-10T16:00:00Z' },
        { id: '2', userId: '5', text: 'Kendi deneyimlerimden örnekler vereceğim.', timestamp: '2023-11-10T16:01:00Z' },
        // Daha fazla mesaj eklenebilir
      ]
    },
    {
      id: '4',
      title: 'Sağlıklı Yaşam Önerileri',
      description: 'Sağlıklı beslenme, düzenli egzersiz ve mental sağlık konularında uzman tavsiyeleri ve günlük uygulanabilir öneriler.',
      hosts: [
        { id: '6', name: 'Deniz Şahin', avatar: 'https://i.pravatar.cc/150?img=6' }
      ],
      participants: 89,
      topics: ['Sağlık', 'Spor', 'Beslenme'],
      isLive: false,
      scheduledFor: '2023-11-15T18:00:00Z',
      messages: []
    },
    {
      id: '5',
      title: 'Film Önerileri ve Sinema Üzerine',
      description: 'Son çıkan filmler, klasik eserler ve sinema dünyasındaki gelişmeler hakkında keyifli sohbetler.',
      hosts: [
        { id: '7', name: 'Berk Özkan', avatar: 'https://i.pravatar.cc/150?img=7' },
        { id: '8', name: 'Selin Koç', avatar: 'https://i.pravatar.cc/150?img=8' }
      ],
      participants: 174,
      topics: ['Sinema', 'Sanat'],
      isLive: true,
      messages: [
        { id: '1', userId: '7', text: 'Bu hafta vizyona giren filmleri değerlendiriyoruz. Siz hangi filmleri izlediniz?', timestamp: '2023-11-10T19:30:00Z' },
        // Daha fazla mesaj eklenebilir
      ]
    }
  ];
  
  export const USERS = [
    { id: '0', name: 'Kaan Çelik', username: '@kaan', avatar: 'https://firebasestorage.googleapis.com/v0/b/tromeapp-59162.firebasestorage.app/o/profile_images%2FPhjvwTkou6eMGttNAK8EOlv68Xc2?alt=media&token=19ebfcf6-f042-4d36-8a3b-046a4ad45e24', followers: 1248, bio: 'Yazılım geliştirici ve teknoloji meraklısı' },
    { id: '1', name: 'Ahmet Yılmaz', username: '@ahmetyilmaz', avatar: 'https://i.pravatar.cc/150?img=1', followers: 1248, bio: 'Yazılım geliştirici ve teknoloji meraklısı' },
    { id: '2', name: 'Ayşe Kaya', username: '@aysekaya', avatar: 'https://i.pravatar.cc/150?img=2', followers: 872, bio: 'UX tasarımcısı ve dijital sanatçı' },
    { id: '3', name: 'Mehmet Demir', username: '@mehmetdemir', avatar: 'https://i.pravatar.cc/150?img=3', followers: 1536, bio: 'Müzisyen ve müzik prodüktörü' },
    { id: '4', name: 'Zeynep Öztürk', username: '@zeynepozturk', avatar: 'https://i.pravatar.cc/150?img=4', followers: 954, bio: 'Girişimci ve yatırımcı' },
    { id: '5', name: 'Can Yiğit', username: '@canyigit', avatar: 'https://i.pravatar.cc/150?img=5', followers: 682, bio: 'Startup mentor ve iş geliştirme uzmanı' },
    { id: '6', name: 'Deniz Şahin', username: '@denizsahin', avatar: 'https://i.pravatar.cc/150?img=6', followers: 1120, bio: 'Beslenme uzmanı ve fitness eğitmeni' },
    { id: '7', name: 'Berk Özkan', username: '@berkozkan', avatar: 'https://i.pravatar.cc/150?img=7', followers: 843, bio: 'Film eleştirmeni ve senarist' },
    { id: '8', name: 'Selin Koç', username: '@selinkoc', avatar: 'https://i.pravatar.cc/150?img=8', followers: 976, bio: 'Sinema tutkunu ve blog yazarı' }
  ];
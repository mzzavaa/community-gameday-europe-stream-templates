import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Img,
  staticFile,
} from "remotion";

// ── Logo URL map from Notion database (48 matched groups) ──
const LOGO_MAP: Record<string, string> = {
  "AWS Barcelona User Group": "https://awscommunitydach.notion.site/image/attachment%3Abab0b0ca-430c-4f2c-87d8-addabb6a58e4%3ABarcelona_AWS_Meetup_-_Barcelona_Spain.jpg?table=block&id=3090df17-987f-801b-8293-f5bc23b28cd7&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS Leeds User Group": "https://awscommunitydach.notion.site/image/attachment%3Aa44fddbe-f136-4e7c-921b-3b136bf669a8%3AAWS_Leeds_User_Group_-_Leeds_United_Kingdom.png?table=block&id=3090df17-987f-805b-9f0e-cd82e57e193a&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS Meetup JKL": "https://awscommunitydach.notion.site/image/attachment%3Ac12d3c97-2d59-49c7-982d-f69ba78b97ab%3AAWS_Meetup_JKL_-_Jyvaskyla_Finland.jpg?table=block&id=3090df17-987f-80d7-8c85-c4635d0cd9f6&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS Swiss UG – Lausanne": "https://awscommunitydach.notion.site/image/attachment%3A29167be8-f7e3-4bbf-a2e2-c5900e748ed2%3AAWS_Swiss_User_Group_Lausanne_-_Lausanne_Switzerland.jpg?table=block&id=3090df17-987f-8087-aac2-f8f70f8e73e5&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS Swiss UG – Zürich": "https://awscommunitydach.notion.site/image/attachment%3Aca72070d-6b0e-485b-8aba-982587338967%3AAWS_Swiss_User_Group_Zurich_-_Zurich_Switzerland.png?table=block&id=3090df17-987f-8080-a059-c39afedbd2ad&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS Swiss UG – Geneva": "https://awscommunitydach.notion.site/image/attachment%3Ab00df73a-3fce-4ab6-9160-f26c286ddc57%3AAWS_Swiss_User_Group_Geneva_-_Geneva_Switzerland.jpg?table=block&id=3090df17-987f-805d-9d4b-d332f0de2d65&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group 3City": "https://awscommunitydach.notion.site/image/attachment%3A084ad48f-6cc9-42a1-94bf-d80ba67cbcf4%3AAWS_User_Group_3city_-_Gdansk_Poland.jpg?table=block&id=3090df17-987f-80b9-9bb2-d8fe382296e4&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Asturias": "https://awscommunitydach.notion.site/image/attachment%3A1c011945-7274-4cfc-9991-2a3e66bedc18%3AAWS_User_Group_Asturias_-_Asturias__Spain.jpg?table=block&id=3090df17-987f-80a2-abb1-ca6b20107d6c&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Belgium": "https://awscommunitydach.notion.site/image/attachment%3Aa2bebf97-0c45-43d1-bc06-f05186e7711b%3AAWS_User_Group_Belgium_-_Brussels_Belgium.jpg?table=block&id=3090df17-987f-8051-8049-de5a1b58677b&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Bonn": "https://awscommunitydach.notion.site/image/attachment%3A652f7195-fe23-4fc9-9dec-e862255aba76%3AAWS_User_Group_Bonn_-_Bonn_germany.jpg?table=block&id=3090df17-987f-80a8-a0f3-d6b462249f59&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Budapest": "https://awscommunitydach.notion.site/image/attachment%3A148c8f1c-2ddc-4255-b9de-344b7550fe79%3AAWS_User_Group_Budapest_-_Budapest_Hungary.jpg?table=block&id=3090df17-987f-8029-95fd-e8c5481a7776&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Cologne": "https://awscommunitydach.notion.site/image/attachment%3A240fd818-b943-4532-9d48-e4f87fe3172c%3ACologne_AWS_User_Group_-_Koln_Germany.jpg?table=block&id=3090df17-987f-8069-ad76-c7655e401938&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Cuneo": "https://awscommunitydach.notion.site/image/attachment%3A06e2d2a3-8eca-425f-897f-6af6871e1604%3AAWS_User_Group_Cuneo_-_Cuneo_Italy.jpg?table=block&id=3090df17-987f-801a-89d8-c722e33ae05d&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Dortmund": "https://awscommunitydach.notion.site/image/attachment%3A78b9d449-4c9f-4255-bfa0-e8bd64d32db4%3ADortmund_AWS_User_Group_-_Dortmund_Germany.jpg?table=block&id=3090df17-987f-8018-ba9b-fc837e852a94&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Finland": "https://awscommunitydach.notion.site/image/attachment%3Af0afbb70-a7cd-447b-b7e0-e15236dd1f9d%3AAWS_User_Group_Finland_-_Helsinki_Finland.png?table=block&id=3090df17-987f-8060-94cd-d7e2d581c4b9&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG France – Paris": "https://awscommunitydach.notion.site/image/attachment%3A440eff7c-bf83-4ea8-891f-92ff06f4d21c%3AParis_AWS_User_Group_-_Paris_France.jpg?table=block&id=3090df17-987f-80ed-a3a8-dbcef6dccad2&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Hannover": "https://awscommunitydach.notion.site/image/attachment%3Abea90e92-9438-4101-ab68-f9dcb531f6c8%3AAWS_User_Group_Hannover_-_Hannover_Germany.jpg?table=block&id=3090df17-987f-800a-a5de-cddcc070c625&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Istanbul": "https://awscommunitydach.notion.site/image/attachment%3A210e3fe7-e492-420e-a9e1-ef2d70afa6f1%3AAWS_User_Group_Turkey_-_Istanbul_Turkey.jpg?table=block&id=3090df17-987f-809d-881a-c7c59fdb0af8&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Kuopio": "https://awscommunitydach.notion.site/image/attachment%3A2f05ce9c-c63e-4080-8f80-880301a5b998%3AAWS_User_Group_Kuopio_-_Kuopio_Finland.jpg?table=block&id=3090df17-987f-80b1-8111-eeb36b08eba1&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Ljubljana": "https://awscommunitydach.notion.site/image/attachment%3A2de4f682-f74e-4056-af49-cd8d337ef179%3AAWS_User_Group_Ljubljana_-_Ljubljana_Slovenia.png?table=block&id=3090df17-987f-80b9-bab5-c68e213f911c&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Moldova": "https://awscommunitydach.notion.site/image/attachment%3A52a37661-a6ae-4f8d-847f-9e0a26df51c7%3AAWS_User_Group_Moldova_-_Moldova.jpg?table=block&id=3090df17-987f-8039-8c3e-ef837910c9e0&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Montenegro": "https://awscommunitydach.notion.site/image/attachment%3Ad3a48bac-2ef9-4cf6-82a3-85199a27667b%3AAWS_User_Group_Montenegro_-_Podgorica_Montenegro.jpg?table=block&id=3090df17-987f-80aa-9dd7-c69f703ccc70&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Munich": "https://awscommunitydach.notion.site/image/attachment%3Af48e601c-e720-4b42-b3ad-4bf32cecef88%3AAWS_Munich_-_Munchen_Germany.jpg?table=block&id=3090df17-987f-807a-bd78-ebfbee2a149e&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Münsterland": "https://awscommunitydach.notion.site/image/attachment%3A58b1df12-0f74-4e33-a45f-b5483b9c6301%3AAWS_Usergroup_Munsterland_-_Munster_Germany.jpg?table=block&id=3090df17-987f-8027-b00e-e8dea5e84c03&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Napoli": "https://awscommunitydach.notion.site/image/attachment%3A4132f77a-721f-4c63-841d-6649470dff7f%3AAWS_User_Group_Napoli_-_Italy.jpg?table=block&id=3090df17-987f-8055-a3ef-dee8ce546a89&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Nürnberg": "https://awscommunitydach.notion.site/image/attachment%3Ad2da7026-4d46-461f-8b63-e4573f03d656%3ANurnberg_AWS_User_Group_-_Nurnberg_Germany.png?table=block&id=3090df17-987f-8081-a841-e0cd46ba9938&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Oslo": "https://awscommunitydach.notion.site/image/attachment%3A51051ff8-2cd3-4d97-8fe4-ac76c6503bf2%3AAWS_User_Group_Norway_-_Oslo_Norway.jpg?table=block&id=3090df17-987f-80b3-a66b-c3cab5b38750&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Pavia": "https://awscommunitydach.notion.site/image/attachment%3Aae1c6de3-8814-459a-81c6-073d54331b14%3AAWS_User_Group_Pavia_-_Pavia_Italy.jpg?table=block&id=3090df17-987f-8044-bd3c-cde5cf058d4f&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Roma": "https://awscommunitydach.notion.site/image/attachment%3A3dc7bd7a-82eb-4c40-9fd8-15fd273eb535%3AAWS_User_Group_Roma_-_Rome_Italy.jpg?table=block&id=3090df17-987f-8052-bba4-f2aa19fd9a50&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Sarajevo": "https://awscommunitydach.notion.site/image/attachment%3A97503699-83ed-4c84-9c50-c5f77993de47%3AAWS_User_Group_Sarajevo_-_Sarajevo_Bosnia__Herzegovina.jpg?table=block&id=3090df17-987f-807e-8d08-edc9676227b8&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Skåne": "https://awscommunitydach.notion.site/image/attachment%3Ae208f290-0a3a-4899-bc78-7c7e881db78b%3AAWS_User_Group_Oresund_-_Malmo_Sweden.jpg?table=block&id=3090df17-987f-809e-9966-d1421cac51f6&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Tampere": "https://awscommunitydach.notion.site/image/attachment%3A70f51313-d2a2-4abf-b213-96fbf8ce997e%3AAWS_User_Group_Tampere_-_Tampere_Finland.png?table=block&id=3090df17-987f-80de-bb20-c625cca80e58&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Ticino": "https://awscommunitydach.notion.site/image/attachment%3A495bf9b6-57f4-4ad2-bd8c-e4cde0dc88a2%3AAWS_User_Group_Ticino_-_Lugano_Switzerland.jpg?table=block&id=3090df17-987f-8051-9f72-f8d3eaf4df64&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Timisoara": "https://awscommunitydach.notion.site/image/attachment%3Aa03c9dfb-469d-4a4c-ba98-e34b7018cb92%3AAWS__User_Group_Timisoara_-_Timisoara_Romania.jpg?table=block&id=3090df17-987f-80ac-86ba-d6e30a97d859&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Venezia": "https://awscommunitydach.notion.site/image/attachment%3A7ababf38-9742-431b-a201-a7210dc325cb%3AAWS_User_Group_Venezia_-_Venezia_Italy.jpg?table=block&id=3090df17-987f-80d8-98dd-d12bb63c8026&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS User Group Vienna": "https://awscommunitydach.notion.site/image/attachment%3A7f5dcfa0-c808-411f-85e7-b8b2283e2c5a%3AAWS_Vienna_-_Vienna_Austria.jpg?table=block&id=3090df17-987f-80a9-a26b-de59a394b30a&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG Warsaw": "https://awscommunitydach.notion.site/image/attachment%3A58635b85-fd99-4dd8-a0da-1913d3a98ef3%3AAWS_User_Group_Warsaw_-_Warsaw_Poland.jpg?table=block&id=3090df17-987f-801c-bfe4-ee51e920bdfa&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS UG West Midlands": "https://awscommunitydach.notion.site/image/attachment%3A892b6ef0-6c26-47ad-b449-6623888e9c1e%3AAWS_User_Group_West_Midlands_-_Birmingham_United_Kingdom.jpg?table=block&id=3090df17-987f-807a-8e73-dc4b97fbf9a7&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "AWS Women's UG Munich": "https://awscommunitydach.notion.site/image/attachment%3A99618fea-90aa-4f27-a8ce-ffd190cdbcba%3AAWS_Womens_User_Group_Munich_-_Munich_Germany.jpg?table=block&id=3090df17-987f-80d5-9c37-ceb479ea4ab7&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Berlin AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3A70c06203-3c89-4f2b-9695-d85640023ca4%3ABerlin_AWS_User_Group_-_Berlin_Germany.jpg?table=block&id=3090df17-987f-8057-9354-fb9723d73f03&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Bucharest AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3Abf4634c6-0332-44b7-8f15-d16ccef38448%3ABucharest_AWS_User_Group_-_Bucharest_Romania.jpg?table=block&id=3090df17-987f-80b2-b533-f7e2daac4971&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Dresden AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3A4ceb1330-bdee-45ed-ac0c-91f4bc37d0d9%3ADresden_AWS_User_Group_-_Dresden_Germany.png?table=block&id=3090df17-987f-8005-b160-e80d422468ae&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Frankfurt AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3Ad68cc1ee-db7e-43c0-8672-0d5988ced3c5%3AFrankfurt_AWS_User_Group_-_Frankfurt_Germany.png?table=block&id=3090df17-987f-8083-8ef5-cc011bacd537&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Grenoble AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3A8ef6d052-53ab-491b-ae2c-c14b03044c8a%3AGrenoble_AWS_User_Group_-_Grenoble_France.jpg?table=block&id=3090df17-987f-8016-b4dd-d9f72c4126c0&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Leipzig AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3A19e4136f-40ce-40eb-831b-a1126c0360c1%3ALeipzig_AWS_User_Group_-_Leipzig_Germany.png?table=block&id=3090df17-987f-808e-9d0e-dd9f24004e5b&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Lille AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3A1a091f05-3e63-4354-991c-76a39daa80fa%3ALille_AWS_AWS_User_Group_-_Lille_France_France.png?table=block&id=3090df17-987f-8027-855b-c340ccc15ee1&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
  "Poitiers AWS User Group": "https://awscommunitydach.notion.site/image/attachment%3Afca95638-4901-4897-9b52-5f0ca71aed0a%3APoitiers_AWS_User_Group_-_Poitiers_France.jpg?table=block&id=3090df17-987f-801e-8826-ed2b5ad82cba&spaceId=a54b381a-7fea-4896-b7cd-6ef5fe2ecb82&width=520&userId=&cache=v2",
};

// ── All 57 participating user groups ──
const USER_GROUPS = [
  { flag: "🇪🇸", name: "AWS Barcelona User Group", city: "Barcelona, Spain" },
  { flag: "🇬🇧", name: "AWS Leeds User Group", city: "Leeds, United Kingdom" },
  { flag: "🇫🇮", name: "AWS Meetup JKL", city: "Jyväskylä, Finland" },
  { flag: "🇨🇭", name: "AWS Swiss UG – Lausanne", city: "Lausanne, Switzerland" },
  { flag: "🇨🇭", name: "AWS Swiss UG – Zürich", city: "Zürich, Switzerland" },
  { flag: "🇨🇭", name: "AWS Swiss UG – Geneva", city: "Geneva, Switzerland" },
  { flag: "🇷🇴", name: "AWS Transylvania Cloud", city: "Cluj-Napoca, Romania" },
  { flag: "🇵🇱", name: "AWS User Group 3City", city: "Gdansk, Poland" },
  { flag: "🇪🇸", name: "AWS UG Asturias", city: "Oviedo, Spain" },
  { flag: "🇬🇷", name: "AWS User Group Athens", city: "Athens, Greece" },
  { flag: "🇧🇪", name: "AWS User Group Belgium", city: "Brussels, Belgium" },
  { flag: "🇩🇪", name: "AWS User Group Bonn", city: "Bonn, Germany" },
  { flag: "🇭🇺", name: "AWS User Group Budapest", city: "Budapest, Hungary" },
  { flag: "🇩🇪", name: "AWS User Group Cologne", city: "Köln, Germany" },
  { flag: "🇮🇹", name: "AWS User Group Cuneo", city: "Cuneo, Italy" },
  { flag: "🇩🇪", name: "AWS User Group Dortmund", city: "Dortmund, Germany" },
  { flag: "🇫🇮", name: "AWS User Group Finland", city: "Helsinki, Finland" },
  { flag: "🇫🇷", name: "AWS UG France – Paris", city: "Paris, France" },
  { flag: "🇪🇸", name: "AWS UG Galicia", city: "Santiago de Compostela, Spain" },
  { flag: "🇮🇹", name: "AWS User Group Genova", city: "Genova, Italy" },
  { flag: "🇩🇪", name: "AWS User Group Hannover", city: "Hannover, Germany" },
  { flag: "🇳🇴", name: "AWS UG Innlandet", city: "Hamar, Norway" },
  { flag: "🇹🇷", name: "AWS User Group Istanbul", city: "Istanbul, Turkey" },
  { flag: "🇺🇦", name: "AWS UG Ivano-Frankivsk", city: "Ivano-Frankivsk, Ukraine" },
  { flag: "🇫🇮", name: "AWS User Group Kuopio", city: "Kuopio, Finland" },
  { flag: "🇸🇮", name: "AWS UG Ljubljana", city: "Ljubljana, Slovenia" },
  { flag: "🇲🇰", name: "AWS UG Macedonia", city: "Skopje, Macedonia" },
  { flag: "🇪🇸", name: "AWS User Group Malaga", city: "Malaga, Spain" },
  { flag: "🇲🇩", name: "AWS UG Moldova", city: "Chisinau, Moldova" },
  { flag: "🇲🇪", name: "AWS UG Montenegro", city: "Podgorica, Montenegro" },
  { flag: "🇩🇪", name: "AWS User Group Munich", city: "München, Germany" },
  { flag: "🇩🇪", name: "AWS UG Münsterland", city: "Münster, Germany" },
  { flag: "🇮🇹", name: "AWS User Group Napoli", city: "Naples, Italy" },
  { flag: "🇩🇪", name: "AWS UG Nürnberg", city: "Nürnberg, Germany" },
  { flag: "🇳🇴", name: "AWS UG Oslo", city: "Oslo, Norway" },
  { flag: "🇮🇹", name: "AWS User Group Pavia", city: "Pavia, Italy" },
  { flag: "🇮🇹", name: "AWS User Group Roma", city: "Roma, Italy" },
  { flag: "🇮🇹", name: "AWS User Group Salerno", city: "Salerno, Italy" },
  { flag: "🇧🇦", name: "AWS UG Sarajevo", city: "Sarajevo, Bosnia & Herzegovina" },
  { flag: "🇸🇪", name: "AWS UG Skåne", city: "Malmö, Sweden" },
  { flag: "🇫🇮", name: "AWS UG Tampere", city: "Tampere, Finland" },
  { flag: "🇨🇭", name: "AWS UG Ticino", city: "Lugano, Switzerland" },
  { flag: "🇷🇴", name: "AWS UG Timisoara", city: "Timisoara, Romania" },
  { flag: "🇮🇹", name: "AWS UG Venezia", city: "Venice, Italy" },
  { flag: "🇦🇹", name: "AWS User Group Vienna", city: "Vienna, Austria" },
  { flag: "🇵🇱", name: "AWS UG Warsaw", city: "Warsaw, Poland" },
  { flag: "🇬🇧", name: "AWS UG West Midlands", city: "Birmingham, United Kingdom" },
  { flag: "🇮🇹", name: "AWS Well-Architected UG Italy", city: "Milano, Italy" },
  { flag: "🇩🇪", name: "AWS Women's UG Munich", city: "Munich, Germany" },
  { flag: "🇩🇪", name: "Berlin AWS User Group", city: "Berlin, Germany" },
  { flag: "🇷🇴", name: "Bucharest AWS User Group", city: "Bucharest, Romania" },
  { flag: "🇩🇪", name: "Dresden AWS User Group", city: "Dresden, Germany" },
  { flag: "🇩🇪", name: "Frankfurt AWS User Group", city: "Frankfurt, Germany" },
  { flag: "🇫🇷", name: "Grenoble AWS User Group", city: "Grenoble, France" },
  { flag: "🇩🇪", name: "Leipzig AWS User Group", city: "Leipzig, Germany" },
  { flag: "🇫🇷", name: "Lille AWS User Group", city: "Lille, France" },
  { flag: "🇫🇷", name: "Poitiers AWS User Group", city: "Poitiers, France" },
];

const COUNTRIES = Array.from(new Set(USER_GROUPS.map((g) => g.flag)));

// ── Background image for European GameDay ──
const BG_IMAGE = "AWSCommunityGameDayEurope/background_landscape_colour.png";

// ── GameDay color palette ──
const GD_DARK = "#0c0820";
const GD_PURPLE = "#6c3fa0";
const GD_VIOLET = "#8b5cf6";
const GD_INDIGO = "#4f46e5";
const GD_PINK = "#d946ef";
const GD_ACCENT = "#c084fc";

// ── Helpers ──
function useSpring(frame: number, fps: number, delay: number) {
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
}

function CountUp({ target, frame, startFrame, suffix = "" }: { target: number; frame: number; startFrame: number; suffix?: string }) {
  const progress = Math.min(1, Math.max(0, (frame - startFrame) / 60));
  const eased = 1 - Math.pow(1 - progress, 3);
  const value = Math.round(eased * target);
  return <>{value}{suffix}</>;
}

// ── Logo component: shows Notion logo or flag-only placeholder ──
// Cover image for cards — full-width banner like Notion gallery view
const CardCover: React.FC<{ name: string; flag: string; accentColor: string }> = ({ name, flag, accentColor }) => {
  const logoUrl = LOGO_MAP[name];
  if (logoUrl) {
    return (
      <div style={{
        width: "100%", flex: 1, minHeight: 0, borderRadius: "12px 12px 0 0",
        overflow: "hidden", position: "relative",
      }}>
        <Img
          src={logoUrl}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
          }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
          background: "linear-gradient(transparent, rgba(12,8,32,0.6))",
        }} />
      </div>
    );
  }
  // Fallback: gradient cover with large flag
  return (
    <div style={{
      width: "100%", flex: 1, minHeight: 0, borderRadius: "12px 12px 0 0",
      background: `linear-gradient(135deg, ${accentColor}30, ${GD_DARK})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      <div style={{ fontSize: 72, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
        {flag}
      </div>
    </div>
  );
};

// ── Scene 1: Hero Title (frames 0–150) ──
const HeroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleSpring = useSpring(frame, fps, 5);
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const dateOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
  const statsOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });
  const badgeSpring = useSpring(frame, fps, 70);
  const glowPulse = interpolate(frame, [0, 60, 120], [0.3, 0.7, 0.3], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: GD_DARK }}>
      <Img src={staticFile(BG_IMAGE)} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.15 }} />
      <AbsoluteFill style={{ background: "rgba(12,8,32,0.65)" }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 800, height: 800,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PURPLE}${Math.round(glowPulse * 40).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        borderRadius: "50%",
      }} />
      <AbsoluteFill style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="hexgridV2" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c084fc" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexgridV2)" />
        </svg>
      </AbsoluteFill>
      <div style={{
        position: "absolute", top: 20, left: 40,
        opacity: interpolate(frame, [0, 20], [0, 0.8], { extrapolateRight: "clamp" }),
      }}>
        <Img
          src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric.png")}
          style={{ height: 48 }}
        />
      </div>
      <div style={{
        position: "absolute", top: 120, left: 0, right: 0,
        textAlign: "center",
        transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
        opacity: titleSpring,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: GD_ACCENT,
          letterSpacing: "4px", textTransform: "uppercase",
          fontFamily: "'Inter', sans-serif", marginBottom: 12,
        }}>
          COMMUNITY
        </div>
        <div style={{
          fontSize: 64, fontWeight: 900, letterSpacing: "-2px",
          fontFamily: "'Inter', sans-serif", lineHeight: 1,
          background: `linear-gradient(135deg, #ffffff 0%, ${GD_ACCENT} 50%, ${GD_PINK} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          GAMEDAY
        </div>
        <div style={{
          fontSize: 28, fontWeight: 700, color: "#ffffff",
          fontFamily: "'Inter', sans-serif", marginTop: 8,
          letterSpacing: "6px", opacity: subtitleOpacity,
        }}>
          EUROPE
        </div>
      </div>
      <div style={{
        position: "absolute", top: 340, left: 0, right: 0,
        textAlign: "center", opacity: dateOpacity,
      }}>
        <span style={{
          fontSize: 22, fontWeight: 600, color: GD_PINK,
          fontFamily: "'Inter', sans-serif",
        }}>
          17 March 2026
        </span>
      </div>
      <div style={{
        position: "absolute", top: 420, left: 80, right: 80,
        display: "flex", justifyContent: "center", gap: 80,
        opacity: statsOpacity,
      }}>
        {[
          { label: "User Groups", value: 57, suffix: "", start: 60, isCountUp: true },
          { label: "Countries", value: COUNTRIES.length, suffix: "+", start: 65, isCountUp: true },
          { label: "One Epic Day", value: 1, suffix: "", start: 70, isCountUp: false },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
              {stat.isCountUp ? (
                <CountUp target={stat.value} frame={frame} startFrame={stat.start} suffix={stat.suffix} />
              ) : (
                <>{stat.value}{stat.suffix}</>
              )}
            </div>
            <div style={{
              fontSize: 12, color: "#94a3b8", marginTop: 4,
              textTransform: "uppercase", letterSpacing: "2px",
              fontFamily: "'Inter', sans-serif",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeSpring,
        transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${GD_INDIGO}, ${GD_PINK})`,
          borderRadius: 12, padding: "10px 28px",
          fontSize: 14, fontWeight: 700, color: "#ffffff",
          fontFamily: "'Inter', sans-serif", letterSpacing: "1px",
        }}>
          <Img src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric.png")} style={{ height: 24, marginRight: 8 }} />
          Meet the Participating Communities
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Scrolling User Group Cards with Logos (frames 150–1350) ──
const GROUPS_PER_PAGE = 6;
const PAGE_DURATION = 120;
const TOTAL_PAGES = Math.ceil(USER_GROUPS.length / GROUPS_PER_PAGE);

const GroupsScrollScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const TRANSITION_LEAD = 6;
  const adjustedFrame = frame + TRANSITION_LEAD;
  const currentPage = Math.min(Math.floor(adjustedFrame / PAGE_DURATION), TOTAL_PAGES - 1);
  const pageFrame = adjustedFrame - currentPage * PAGE_DURATION;
  const startIdx = currentPage * GROUPS_PER_PAGE;
  const pageGroups = USER_GROUPS.slice(startIdx, startIdx + GROUPS_PER_PAGE);

  const pageExit = interpolate(pageFrame, [PAGE_DURATION - 8, PAGE_DURATION], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pageLabel = `${currentPage + 1} / ${TOTAL_PAGES}`;
  const progress = (currentPage + 1) / TOTAL_PAGES;

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <Img src={staticFile(BG_IMAGE)} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.12 }} />
      <AbsoluteFill style={{ background: "rgba(12,8,32,0.60)" }} />
      <AbsoluteFill style={{ opacity: 0.02 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid2V2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c084fc" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2V2)" />
        </svg>
      </AbsoluteFill>

      {/* Header bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 56,
        background: `linear-gradient(90deg, ${GD_PURPLE}40, ${GD_INDIGO}40)`,
        borderBottom: `1px solid ${GD_VIOLET}30`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: GD_ACCENT, letterSpacing: "2px", display: "flex", alignItems: "center" }}>
          <Img src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric.png")} style={{ height: 22, marginRight: 10 }} />
          AWS COMMUNITY GAMEDAY EUROPE
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>
          {pageLabel}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute", top: 56, left: 0, right: 0, height: 3,
        background: "rgba(255,255,255,0.05)",
      }}>
        <div style={{
          height: "100%", width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${GD_INDIGO}, ${GD_PINK})`,
        }} />
      </div>

      {/* 3×2 grid of group cards */}
      <div style={{
        position: "absolute", top: 80, left: 40, right: 40, bottom: 60,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 16,
      }}>
        {pageGroups.map((group, i) => {
          const cardSpring = spring({
            frame: pageFrame - i * 4,
            fps,
            config: { damping: 16, stiffness: 100 },
          });
          const slideDir = i % 2 === 0 ? -30 : 30;
          const colors = [GD_VIOLET, GD_INDIGO, GD_PURPLE, GD_PINK, GD_ACCENT, "#6366f1"];
          const accentColor = colors[(startIdx + i) % colors.length];

          return (
            <div
              key={`${currentPage}-${i}`}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${accentColor}44`,
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                opacity: cardSpring * pageExit,
                transform: `translateY(${interpolate(cardSpring, [0, 1], [slideDir, 0])}px)`,
              }}
            >
              {/* Cover image — Notion gallery style */}
              <CardCover name={group.name} flag={group.flag} accentColor={accentColor} />

              {/* Info section below cover */}
              <div style={{ padding: "8px 14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{group.flag}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "#ffffff",
                    lineHeight: 1.2,
                  }}>
                    {group.name}
                  </div>
                </div>
                <div style={{
                  fontSize: 11, color: "#94a3b8",
                  display: "flex", alignItems: "center", gap: 4,
                  marginLeft: 22,
                }}>
                  📍 {group.city}
                </div>
                <div style={{
                  fontSize: 9, color: "#64748b",
                  marginTop: 2, marginLeft: 22,
                }}>
                  meetup.com/{group.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: total count */}
      <div style={{
        position: "absolute", bottom: 16, left: 40, right: 40,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 11, color: "#475569" }}>
          57 User Groups · {COUNTRIES.length} Countries · 17 March 2026
        </div>
        <div style={{
          fontSize: 11, color: GD_ACCENT, fontWeight: 600,
        }}>
          Showing {startIdx + 1}–{Math.min(startIdx + GROUPS_PER_PAGE, USER_GROUPS.length)} of {USER_GROUPS.length}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Closing CTA ──
const SCROLL_SCREENSHOTS = [
  "website-scroll-1-hero.png",
  "website-scroll-2-usergroups.png",
  "website-scroll-3-grouplist.png",
  "website-scroll-4-vienna.png",
  "website-scroll-5-vienna-meetup.png",
  "website-scroll-6-vienna-events.png",
];
const SCREENSHOT_HEIGHT = 332; // visible area inside browser mockup
// Each screenshot gets ~50 frames of viewing time, with smooth scroll between
const FRAMES_PER_SCREENSHOT = 50;
const SCROLL_TRANSITION_FRAMES = 20;

const ClosingScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleSpring = useSpring(frame, fps, 5);
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const logoSpring = useSpring(frame, fps, 15);
  const websiteSpring = useSpring(frame, fps, 55);
  const screenshotSpring = useSpring(frame, fps, 65);
  const glowPulse = interpolate(frame, [0, 75, 150], [0.2, 0.6, 0.2], { extrapolateRight: "clamp" });

  // Scroll animation starts after browser mockup has appeared (frame 80)
  const scrollStartFrame = 80;
  const scrollFrame = Math.max(0, frame - scrollStartFrame);

  // Calculate which screenshot we're on and the scroll offset
  const totalScrollSteps = SCROLL_SCREENSHOTS.length - 1; // 5 transitions
  const stepDuration = FRAMES_PER_SCREENSHOT + SCROLL_TRANSITION_FRAMES; // 70 frames per step
  const currentStep = Math.min(totalScrollSteps, Math.floor(scrollFrame / stepDuration));
  const frameInStep = scrollFrame - currentStep * stepDuration;

  // Smooth scroll: hold for FRAMES_PER_SCREENSHOT, then transition for SCROLL_TRANSITION_FRAMES
  let scrollProgress = currentStep;
  if (frameInStep > FRAMES_PER_SCREENSHOT && currentStep < totalScrollSteps) {
    const transitionProgress = interpolate(
      frameInStep - FRAMES_PER_SCREENSHOT,
      [0, SCROLL_TRANSITION_FRAMES],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
    // Ease-in-out for smooth scroll
    const eased = transitionProgress < 0.5
      ? 2 * transitionProgress * transitionProgress
      : 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;
    scrollProgress = currentStep + eased;
  }

  const scrollY = -scrollProgress * SCREENSHOT_HEIGHT;

  // Switch URL bar text when we reach the meetup screenshots (index 4+)
  const isMeetupPage = scrollProgress >= 3.5;
  const urlBarText = isMeetupPage
    ? "meetup.com/amazon-web-services-aws-vienna/"
    : "awsgameday.eu";

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <Img src={staticFile(BG_IMAGE)} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.10 }} />
      <AbsoluteFill style={{ background: "rgba(12,8,32,0.72)" }} />
      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 900, height: 900,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PINK}${Math.round(glowPulse * 30).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
        borderRadius: "50%",
      }} />

      {/* Grid */}
      <AbsoluteFill style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid3V2" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c084fc" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid3V2)" />
        </svg>
      </AbsoluteFill>

      {/* Left side: Logo + text */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "row", alignItems: "center",
        padding: "0 60px",
      }}>
        {/* Left column: logo, title, CTA */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "center",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
        }}>
          {/* Community Europe logo */}
          <div style={{
            opacity: logoSpring,
            transform: `scale(${interpolate(logoSpring, [0, 1], [0.8, 1])})`,
            marginBottom: 20,
          }}>
            <Img
              src={staticFile("AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png")}
              style={{ height: 80 }}
            />
          </div>

          <div style={{
            fontSize: 16, fontWeight: 600, color: GD_ACCENT,
            letterSpacing: "4px", textTransform: "uppercase", marginBottom: 12,
          }}>
            17 MARCH 2026
          </div>
          <div style={{
            fontSize: 44, fontWeight: 900, letterSpacing: "-2px",
            lineHeight: 1.1,
            background: `linear-gradient(135deg, #ffffff 0%, ${GD_ACCENT} 50%, ${GD_PINK} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            See You at GameDay!
          </div>
          <div style={{
            fontSize: 14, color: "#94a3b8", marginTop: 12,
            opacity: subtitleOpacity,
          }}>
            57 User Groups · {COUNTRIES.length} Countries · One Epic Competition
          </div>

          {/* Website URL */}
          <div style={{
            marginTop: 24, opacity: websiteSpring,
            transform: `translateY(${interpolate(websiteSpring, [0, 1], [10, 0])}px)`,
            display: "flex", flexDirection: "column", gap: 8,
            alignItems: "center",
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${GD_INDIGO}, ${GD_PINK})`,
              borderRadius: 10, padding: "10px 24px",
              fontSize: 14, fontWeight: 700, color: "#ffffff",
              letterSpacing: "1px",
              display: "flex", alignItems: "center",
            }}>
              🏆 Join Your Local User Group
            </div>
            <div style={{
              fontSize: 16, fontWeight: 600, color: GD_ACCENT,
              letterSpacing: "0.5px",
              textAlign: "center",
            }}>
              www.awsgameday.eu
            </div>
          </div>
        </div>

        {/* Right column: scrolling website preview */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: screenshotSpring,
          transform: `scale(${interpolate(screenshotSpring, [0, 1], [0.85, 1])}) translateX(${interpolate(screenshotSpring, [0, 1], [40, 0])}px)`,
        }}>
          <div style={{
            borderRadius: 12, overflow: "hidden",
            border: `2px solid ${GD_VIOLET}60`,
            boxShadow: `0 20px 60px rgba(139, 92, 246, 0.3)`,
            width: 540, height: 360,
          }}>
            {/* Browser chrome bar */}
            <div style={{
              height: 28, background: "#1e1b2e",
              display: "flex", alignItems: "center", padding: "0 10px", gap: 6,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
              <div style={{
                flex: 1, marginLeft: 8, height: 16, borderRadius: 4,
                background: "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", padding: "0 8px",
                fontSize: 8, color: "#94a3b8",
              }}>
                {urlBarText}
              </div>
            </div>
            {/* Scrolling screenshot container */}
            <div style={{
              width: 540, height: SCREENSHOT_HEIGHT,
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                display: "flex", flexDirection: "column",
                transform: `translateY(${scrollY}px)`,
              }}>
                {SCROLL_SCREENSHOTS.map((filename, i) => (
                  <Img
                    key={i}
                    src={staticFile(`AWSCommunityGameDayEurope/${filename}`)}
                    style={{
                      width: 540, height: SCREENSHOT_HEIGHT,
                      objectFit: "cover", objectPosition: "top",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main Composition ──
const HERO_DURATION = 150;
const SCROLL_DURATION = TOTAL_PAGES * PAGE_DURATION; // 10 × 120 = 1200
const CLOSING_DURATION = 500;
export const TOTAL_DURATION_V2 = HERO_DURATION + SCROLL_DURATION + CLOSING_DURATION;

export const CommunityGamedayEuropeV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: GD_DARK }}>
      <Sequence from={0} durationInFrames={HERO_DURATION}>
        <HeroScene frame={frame} fps={fps} />
      </Sequence>
      <Sequence from={HERO_DURATION} durationInFrames={SCROLL_DURATION}>
        <GroupsScrollScene frame={frame - HERO_DURATION} fps={fps} />
      </Sequence>
      <Sequence from={HERO_DURATION + SCROLL_DURATION} durationInFrames={CLOSING_DURATION}>
        <ClosingScene frame={frame - HERO_DURATION - SCROLL_DURATION} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

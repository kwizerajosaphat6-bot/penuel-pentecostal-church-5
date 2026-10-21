/**
 * Image assets are served as separate, cacheable static files from /public
 * rather than being inlined as base64 into the JS bundle. This keeps the
 * initial HTML payload small and lets the browser lazy-load and cache each
 * image independently (immutable, 1-year cache — see public/_headers).
 */
export const IMG = {
  heroWorship: "/images/hero-worship.jpg",
  pastor: "/images/pastor.jpg",
  /**
   * Community outreach — volunteers serving families.
   * Hosted on the church's CDN.
   */
  community:
    "https://www.rccgfcorleans.org/assets/pictures/community.jpg",
  /**
   * Large church group photograph — used as the About page backdrop.
   */
  groupPhoto:
    "https://res.cloudinary.com/z2vslzvr/image/upload/f_auto,q_auto,w_1600/group_photo_6x.jpg",
  churchBuilding:
    "https://res.cloudinary.com/z2vslzvr/image/upload/f_auto,q_auto,w_1600/church_yard_final.jpg",
  /**
   * Portrait of Bishop Murindabigwi Ferdinand.
   * Served from Cloudinary as a direct image (Cloudinary negotiates the
   * file format automatically via f_auto and optimises with q_auto).
   *
   * To self-host instead (most reliable), download the photo, save it as
   * `public/images/founder.jpg`, and set this to "/images/founder.jpg".
   */
  founder:
    "https://res.cloudinary.com/z2vslzvr/image/upload/f_auto,q_auto/founder_final",
  /**
   * Official emblem / logo of Pentecostal Penuel Church.
   * Transparent PNG hosted on Cloudinary CDN.
   */
  logo:
    "https://res.cloudinary.com/z2vslzvr/image/upload/v1789970157/penuel_logo_transparent.png",
  /**
   * Congregation at prayer (amahugurwa) — used as the atmospheric
   * backdrop on the Who We Are and Publications page heroes.
   */
  worshipGathering:
    "https://res.cloudinary.com/z2vslzvr/image/upload/f_auto,q_auto,w_1600/amahugurwa_3x.jpg",
};

export const CHURCH = {
  name: "Pentecostal Penuel Church",
  shortName: "Penuel PC",
  tagline: "Meet God, be transformed, be blessed",
  verse: "I will not let thee go, except thou bless me.",
  verseRef: "Genesis 32:20–32 (KJV)",
  established: 1998,
  founder: "Bishop Murindabigwi Ferdinand",
  founderTitle: "Founder & Legal Representative",
  location: "Ruyenzi Sector, Kamonyi District",
  country: "Rwanda",
  address: "Ruyenzi Sector, Kamonyi District, Rwanda",
  phone: "+250 794 770 542",
  email: "ferdinandbigwi@gmail.com",
  prayerEmail: "ferdinandbigwi@gmail.com",

  // The church's vision statement — used across the site so it stays consistent.
  vision:
    "To be a church where people meet God, are transformed by His presence, and receive His blessing for their spiritual and physical lives.",
  visionVerses: ["Genesis 32:20–32", "Matthew 28:19–20", "John 13:35"],
};

// Short history — kept as ordered paragraphs so it can be rendered anywhere.
export const HISTORY = {
  intro:
    "Pentecostal Penuel Church began in 1998 in Ruyenzi Sector, Kamonyi District, Rwanda.",
  paragraphs: [
    "Pentecostal Penuel Church began in 1998 in Ruyenzi Sector, Kamonyi District, Rwanda. The church was founded by Bishop Murindabigwi Ferdinand — its founder and legal representative — together with six co-founders, following a calling from God to serve Him and bring His Word to people.",
    "From its beginning, the church has remained in the same location and has continued under the name Pentecostal Penuel Church. What started as a small ministry has gradually grown in both the number of believers and the number of church branches.",
    "As the church grew, its mission also expanded beyond preaching and worship. Pentecostal Penuel Church has established five primary schools in different parts of Rwanda, contributing to the education and development of children and communities.",
    "For more than two decades, the church has continued to serve God and His people through preaching the Gospel, prayer, worship, education, and community service.",
    "Today, Pentecostal Penuel Church looks to the future with the same desire that inspired its founders in 1998: to follow God's calling, help people encounter Him, see lives transformed, and become a blessing to families and communities.",
  ],
};

export const TICKER = [
  "Come as you are",
  "Bring the kids",
  "We pray for each other by name",
  "Nobody here has it all figured out",
  "You're welcome, honestly",
];

export const SERVICES = [
  {
    day: "Sunday",
    time: "9:00 AM – 12:00 PM",
    name: "Main Worship Service",
    desc: "Our main gathering for all Christians — worship, prayer, the Word, and fellowship. Everyone is welcome to come and meet God with us.",
    featured: true,
  },
  {
    day: "Sunday",
    time: "2:00 PM – 5:00 PM",
    name: "Youth Time",
    desc: "The afternoon belongs to the young people — worship, Bible teaching, and honest conversation about walking with God.",
  },
  {
    day: "Saturday",
    time: "9:00 AM – 3:00 PM",
    name: "Revival Fasting Prayer",
    desc: "A day set apart to seek God through fasting and prayer — for revival, for breakthrough, and for one another.",
  },
];

export const STATS = [
  { value: 25, suffix: "+", label: "Years serving God since 1998" },
  { value: 7, suffix: "", label: "Founders who answered God's call" },
  { value: 5, suffix: "", label: "Primary schools across Rwanda" },
];

export const DOCTRINES = [
  {
    icon: "book",
    title: "The Bible",
    text: "We take the Bible as God's word — trustworthy, and the thing we measure everything else against, including ourselves.",
    verse: "All Scripture is given by inspiration of God. — 2 Timothy 3:16",
  },
  {
    icon: "cross",
    title: "One God, Three Persons",
    text: "Father, Son, and Holy Spirit. One God, not three. We don't pretend to fully understand it, but we believe it and we worship Him.",
    verse: "…baptizing them in the name of the Father and of the Son and of the Holy Ghost. — Matthew 28:19",
  },
  {
    icon: "heart",
    title: "Saved by Grace",
    text: "You can't earn your way in. Nobody here did. Salvation is a gift from God through faith in what Jesus already finished.",
    verse: "For by grace are ye saved through faith; and that not of yourselves. — Ephesians 2:8",
  },
  {
    icon: "dove",
    title: "Baptism in the Holy Spirit",
    text: "We believe every believer can be filled with the Holy Spirit, and that speaking in tongues often follows. It's a gift, never a test of who's more spiritual.",
    verse: "And they were all filled with the Holy Ghost, and began to speak with other tongues. — Acts 2:4",
  },
  {
    icon: "flame",
    title: "The Gifts of the Spirit",
    text: "Prophecy, healing, tongues, wisdom — we believe God still gives these, and that they're for building up the church, not showing off.",
    verse: "But the manifestation of the Spirit is given to every man to profit withal. — 1 Corinthians 12:7",
  },
  {
    icon: "people",
    title: "The Church & Communion",
    text: "The church is people, not a building. We gather every Sunday and share the bread and cup to remember what Jesus did.",
    verse: "Do this in remembrance of me. — Luke 22:19",
  },
  {
    icon: "hands",
    title: "Healing",
    text: "We pray for the sick and we believe God heals. We also sit with people He hasn't healed yet, and we keep praying.",
    verse: "With his stripes we are healed. — 1 Peter 2:24",
  },
  {
    icon: "sun",
    title: "Jesus Is Coming Back",
    text: "He said He would return, and we believe Him. It changes how we spend our time and who we bother to love.",
    verse: "…and the dead in Christ shall rise first. — 1 Thessalonians 4:16",
  },
  {
    icon: "star",
    title: "Life After This",
    text: "Death isn't the end of the story for anyone who belongs to Christ. That hope is why we can bury our people singing.",
    verse: "I am the resurrection, and the life. — John 11:25",
  },
];

export const TIMELINE = [
  {
    year: "1998",
    title: "A church is born in Ruyenzi",
    text: "Following a calling from God, Bishop Murindabigwi Ferdinand and six co-founders started Pentecostal Penuel Church in Ruyenzi Sector, Kamonyi District. A small group gathered to pray, worship, and share God's Word.",
  },
  {
    year: "Early years",
    title: "Rooted in one place",
    text: "The church remained in the same location and under the same name, growing steadily as more believers joined and gave their lives to Christ.",
  },
  {
    year: "Growing",
    title: "More believers, more branches",
    text: "What began as a small ministry gradually grew — both in the number of believers and in the number of church branches reaching new communities.",
  },
  {
    year: "Serving",
    title: "Mission beyond the pulpit",
    text: "The church's mission expanded beyond preaching and worship into education and community service, caring for families and neighbourhoods.",
  },
  {
    year: "Five schools",
    title: "Investing in children",
    text: "Pentecostal Penuel Church established five primary schools in different parts of Rwanda, contributing to the education and development of children and communities.",
  },
  {
    year: "Today",
    title: "The same calling, still burning",
    text: "For more than two decades the church has served God and His people through the Gospel, prayer, worship, education, and community service — and still looks to the future with the desire that inspired its founders in 1998.",
  },
];

export const LEADERSHIP = [
  {
    name: "Bishop Murindabigwi Ferdinand",
    role: "Founder, Bishop & Legal Representative",
    note: "Founded Pentecostal Penuel Church in 1998 with six co-founders, following God's calling to serve Him and bring His Word to people. He serves as the church's bishop and legal representative.",
    initials: "MF",
    photo: IMG.founder,
  },
];

export const MINISTRIES = [
  {
    icon: "note",
    title: "The Choir",
    tag: "Sundays · Morning worship",
    desc: "Voices and a band that lead the church in worship. There's no audition — if you can hold a tune, or you're willing to learn, you are welcome to join.",
  },
  {
    icon: "flame",
    title: "Youth Time",
    tag: "Sundays · 2:00 – 5:00 PM",
    desc: "Ages 15 to 30. Worship, Bible teaching, and honest conversation about walking with God. Run by the young people themselves.",
  },
  {
    icon: "people",
    title: "Children's Church",
    tag: "Sundays · during service",
    desc: "Classes for ages 0 to 14 with vetted, trained volunteers. Songs, stories, and a lot of glue. Parents collect from the same door they dropped off at.",
  },
  {
    icon: "leaf",
    title: "Women's Fellowship",
    tag: "Second Saturday · 9:00 AM",
    desc: "Prayer, Bible study, and honest conversation over tea. There's a quiet support circle for new mothers, widows, and anyone going through it.",
  },
  {
    icon: "shield",
    title: "Men's Fellowship",
    tag: "Fourth Saturday · 7:00 AM",
    desc: "An early start, deliberately. Prayer, a passage, and men talking straight about work, money, marriage, and faith.",
  },
  {
    icon: "hands",
    title: "Revival Fasting Prayer",
    tag: "Saturdays · 9:00 AM – 3:00 PM",
    desc: "A day set apart to seek God through fasting and prayer — for revival, for breakthrough, and for one another. If you want someone to pray with you, they'll make time.",
  },
  {
    icon: "radio",
    title: "Radio & Recordings",
    tag: "Sundays · 11:00 AM on air",
    desc: "Sunday's sermon goes out on local radio and into the archive. Free to listen to, free to share, no sign-up.",
  },
  {
    icon: "globe",
    title: "Outreach & New Believers",
    tag: "Ongoing",
    desc: "Home visits, hospital visits, and a nine-month class for anyone new to the faith who wants to start at the beginning.",
  },
];

export const IMPACT = [
  { icon: "book", stat: "1998", label: "Serving God and His people since our founding" },
  { icon: "star", stat: "5", label: "Primary schools established across Rwanda" },
  { icon: "people", stat: "7", label: "Founders led by Bishop Murindabigwi Ferdinand" },
  { icon: "globe", stat: "Many", label: "Church branches reaching new communities" },
  { icon: "flame", stat: "25+", label: "Years of the Gospel, prayer, and worship" },
  { icon: "heart", stat: "Ongoing", label: "Education and community service for families" },
];

export const SERMONS = [
  {
    id: "wrestling-all-night",
    day: "22",
    month: "JUN",
    title: "Wrestling All Night",
    scripture: "Genesis 32:24–30",
    preacher: "Bishop Murindabigwi Ferdinand",
    summary:
      "Jacob met God in the middle of his fear and would not let go until he was blessed. A message about holding on to God through the long night.",
    body: [
      "Jacob was alone, afraid, and out of options. The brother he had wronged was coming to meet him, and there was nowhere left to run. It was in that night — not in comfort, but in crisis — that he met God face to face.",
      "The wrestling did not end quickly. It lasted until daybreak. And when Jacob finally had the chance to let go, he said instead, \"I will not let thee go, except thou bless me.\" That determination is the heart of a life that meets God.",
      "God did not only bless Jacob — He changed his name, and with it his identity and his future. He walked away limping, but he walked away transformed. When we hold on to God through our own long nights, we are never the same again.",
    ],
  },
  {
    id: "filled-and-filled-again",
    day: "15",
    month: "JUN",
    title: "Filled, and Filled Again",
    scripture: "Acts 2:1–4, 38–41",
    preacher: "Penuel Pastoral Team",
    summary:
      "The early church was not filled with the Holy Spirit once and for all — they were filled, and filled again. A call to keep seeking God's presence.",
    body: [
      "On the day of Pentecost, the believers were all together in one place when the Holy Spirit came upon them. That first filling launched the church, but it was not the last time they would need Him.",
      "Throughout the book of Acts we see the same people filled again and again — for boldness, for comfort, for power to serve. The Christian life is not a single experience we look back on; it is a daily dependence on God's Spirit.",
      "The same promise that came to the first believers is for us and for our children. We come to be filled, and we keep coming back to be filled again.",
    ],
  },
  {
    id: "what-enough-feels-like",
    day: "08",
    month: "JUN",
    title: "What Enough Feels Like",
    scripture: "Psalm 23:1–6",
    preacher: "Penuel Pastoral Team",
    summary:
      "\"The Lord is my shepherd; I shall not want.\" A reflection on the deep contentment of trusting the God who provides.",
    body: [
      "Psalm 23 begins with a bold claim: because the Lord is my shepherd, I shall not want. Not because everything is easy, but because the One who leads me is enough.",
      "The shepherd leads to green pastures and still waters, but also through the valley of the shadow of death. In both places, His presence is what makes us safe. Enough is not the absence of trouble — it is the presence of God in the middle of it.",
      "For a people who often carry real needs, this psalm is an invitation to rest. Goodness and mercy are following you. There is room for you at the table. With God as your shepherd, you have enough.",
    ],
  },
];

export const EVENTS_AND_ANNOUNCEMENTS = [
  {
    id: "annual-worship-praise-night",
    day: "12",
    month: "JUL",
    title: "Annual Worship & Praise Night",
    type: "Upcoming Event",
    time: "18:00 – 21:00",
    detail: "Main church, Ruyenzi · All branches gathering for a night of praise and prayer.",
    body: [
      "Once a year, all the branches of the church come together in Ruyenzi for a single evening of worship and prayer. It is one of the highlights of our calendar.",
      "Expect an evening of singing led by our choirs, testimonies from across the branches, and extended time in prayer. Come ready to worship freely — the doors open at 5:30 PM and the gathering runs from 6:00 to 9:00 PM.",
      "Everyone is welcome. Bring your family, bring a friend, and come expecting to meet God together with the whole church family.",
    ],
  },
  {
    id: "community-outreach-health-day",
    day: "20",
    month:"JUL",
    title: "Community Outreach & Health Day",
    type: "Outreach Event",
    time: "09:00 – 15:00",
    detail: "Church grounds, Ruyenzi · Free health checkups, food parcel distribution, and prayer.",
    body: [
      "As part of our commitment to serving our community beyond preaching and worship, we are holding a Community Outreach & Health Day on the church grounds in Ruyenzi.",
      "The day will include free basic health checkups, distribution of food parcels to families in need, and a team available for prayer with anyone who would like it. This is open to the whole community, whether or not you attend the church.",
      "If you would like to volunteer, donate, or help prepare, please speak to any member of the pastoral team after a service or send us a message through the contact page.",
    ],
  },
  {
    id: "youth-fire-fellowship-camp",
    day: "28",
    month: "JUL",
    title: "Youth Fire Fellowship & Camp Sign-up",
    type: "Announcement",
    time: "17:30 – 20:00",
    detail: "Ages 15–30 · Register after Sunday service at the welcome desk or youth hall.",
    body: [
      "Our youth ministry is opening registration for the upcoming Youth Fire Fellowship and camp. This is for young people aged 15 to 30 who want to grow in their faith alongside others their age.",
      "The fellowship meets during Sunday afternoon Youth Time (2:00 – 5:00 PM) with worship, Bible teaching, and honest conversation. The camp is a special weekend away for teaching, fun, and building lasting friendships in Christ.",
      "To register, come to the welcome desk or the youth hall after any Sunday service, or contact the church office. Spaces for the camp are limited, so sign up early.",
    ],
  },
];

export const MEDIA = [
  {
    id: "sunday-worship-photos",
    kind: "Photos",
    title: "Sunday Worship Gallery",
    date: "June 2024",
    image: "heroWorship",
    detail:
      "Moments from our Sunday morning worship — the congregation lifting their voices together in the presence of God.",
    body: [
      "Each Sunday, the church family gathers from 9:00 AM to worship, pray, and sit under the Word of God. These photographs capture something of the joy and reverence of those mornings.",
      "We share these images so that those who cannot always be present — the sick, the travelling, and friends of the church far away — can still feel part of what God is doing here in Ruyenzi.",
    ],
  },
  {
    id: "outreach-community-media",
    kind: "Photos",
    title: "Community Outreach in Pictures",
    date: "2024",
    image: "community",
    detail:
      "Photographs from our outreach days — serving families with food, health support, and prayer beyond the walls of the church.",
    body: [
      "Our mission has always reached beyond preaching and worship. These images document our community outreach: food parcels, health checkups, and time spent praying with neighbours.",
      "They are a reminder that the blessing we receive from God is meant to flow outward — to families, to children, and to whole communities across Rwanda.",
    ],
  },
  {
    id: "our-church-home",
    kind: "Photos",
    title: "Our Church Home in Ruyenzi",
    date: "1998 – today",
    image: "churchBuilding",
    detail:
      "The place where the church has gathered since 1998, in Ruyenzi Sector, Kamonyi District.",
    body: [
      "Pentecostal Penuel Church has remained in the same location since it was founded in 1998. This is the church home where thousands have met God over more than two decades.",
      "From a small beginning, this place has become a centre of worship, prayer, teaching, and community service — and it continues to welcome all who come.",
    ],
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "I came to Penuel carrying many questions about God and about my own life. During prayer, I understood that Jesus was not far from me — He was calling me. I received Him that day, and since then I have been learning to walk with Him step by step.",
    name: "NGIRIMANA Methode",
    role: "Received Jesus at Penuel",
  },
  {
    quote:
      "I came here in 2011 owing money I couldn't talk about to anyone. Nobody fixed it for me. What they did was sit with me every Wednesday until I could face it. That turned out to be the thing I actually needed.",
    name: "BATAMULIZA Jackline",
    role: "Member since 2011",
  },
];

export const VALUES = [
  {
    icon: "book",
    title: "The Word",
    verse: "\u201cYour word is a lamp unto my feet.\u201d — Psalm 119:105",
    text: "We preach through whole passages, including the awkward ones. If we say it, we should be able to show you where it comes from.",
  },
  {
    icon: "hands",
    title: "Prayer",
    verse: "\u201cPray without ceasing.\u201d — 1 Thessalonians 5:17",
    text: "We pray about everything, out loud, often badly. It's the habit that has held this church together longest.",
  },
  {
    icon: "people",
    title: "Each Other",
    verse: "\u201cAnd they continued steadfastly… in fellowship.\u201d — Acts 2:42",
    text: "We show up at hospitals, weddings, and funerals. If you go missing for three weeks, someone will call you.",
  },
  {
    icon: "flame",
    title: "Honesty",
    verse: "\u201cBe ye holy; for I am holy.\u201d — 1 Peter 1:16",
    text: "Living God's way, and admitting plainly when we don't. This is not a place where you have to pretend you're fine.",
  },
  {
    icon: "gift",
    title: "Generosity",
    verse: "\u201cGod loveth a cheerful giver.\u201d — 2 Corinthians 9:7",
    text: "Give what you can, when you can. The books are read out every quarter, down to the last shilling.",
  },
  {
    icon: "heart",
    title: "Service",
    verse: "\u201cAs I have done for you, so should ye do.\u201d — John 13:14",
    text: "Everyone stacks chairs, including the pastors. It's a small thing that says most of what we mean.",
  },
];

export const OBJECTIVES = [
  {
    text: "To create space for people to genuinely meet God — in worship, in prayer, and in His Word.",
    verse: "Genesis 32:20–32",
  },
  {
    text: "To see lives transformed by God's presence, so people leave changed, not just informed.",
    verse: "2 Corinthians 3:18",
  },
  {
    text: "To pray for God's blessing on people's spiritual and physical lives — health, families, and work.",
    verse: "Genesis 32:26",
  },
  {
    text: "To help every believer keep following Jesus for the long haul, growing in faith together.",
    verse: "Acts 2:42–47",
  },
  {
    text: "To carry that same encounter and blessing beyond our walls, to the sick, the grieving, and the overlooked.",
    verse: "Matthew 25:35–40",
  },
];

export const FAITH_STATEMENT = [
  {
    head: "God",
    text: "We believe in one God who has always existed as Father, Son, and Holy Spirit — the maker of heaven and earth, and of everyone reading this. (Matthew 28:19; John 10:30)",
  },
  {
    head: "The Bible",
    text: "We believe the Bible is God's word, reliable and complete, and that it is enough to lead a person to salvation and to guide a whole life. (2 Timothy 3:16–17)",
  },
  {
    head: "People and Sin",
    text: "We believe everyone has sinned and fallen short, and that no amount of good behaviour settles that account. This includes everyone leading this church. (Romans 3:23; 6:23)",
  },
  {
    head: "Jesus",
    text: "We believe Jesus was born of a virgin, lived without sin, died on a cross in our place, rose from the dead on the third day, and is alive now. (1 Corinthians 15:3–4)",
  },
  {
    head: "Salvation",
    text: "We believe a person is saved by grace, through faith in what Jesus did — not by works, background, or effort — and is then changed by the Holy Spirit over time. (Ephesians 2:8–9)",
  },
  {
    head: "The Holy Spirit",
    text: "We believe the Holy Spirit is at work today: filling believers, giving gifts to the church, comforting, correcting, and making people new. (Acts 1:8; 2:4; 1 Corinthians 12:7–11)",
  },
  {
    head: "The Church",
    text: "We believe the church is people, gathered locally to worship, learn, share communion, and look after one another — led by a senior pastor and a council of elders. (Matthew 16:18; Acts 20:28)",
  },
  {
    head: "What Comes Next",
    text: "We believe Jesus will return, the dead will rise, and those who belong to Him will be with Him for good. That hope shapes how we live now. (Titus 2:13; John 11:25–26)",
  },
];

export const FAQS = [
  {
    q: "What should I wear?",
    a: "Whatever you own. You'll see suits and you'll see jeans on the same row. Nobody is checking, and if anyone ever makes you feel otherwise, please tell a pastor.",
  },
  {
    q: "Do I have to stand up or say anything?",
    a: "No. You can sit through the whole thing and not sing a word. Nobody will single you out, ask you to introduce yourself, or make you stand up as a visitor. We promise.",
  },
  {
    q: "What actually happens on a Sunday?",
    a: "The main worship service runs from 9:00 AM to 12:00 PM — worship, prayer, and the preaching of God's Word, with time for fellowship. In the afternoon, from 2:00 to 5:00 PM, the young people gather for Youth Time.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. This site has no trackers and no third-party code, so nothing about your visit is shared with anyone. Whatever you tell us in a message or in person stays with the pastoral team unless you ask us to pass it on.",
  },
  {
    q: "Can someone pray for me or my family?",
    a: "Of course. Join our Saturday revival fasting prayer (9:00 AM – 3:00 PM), write to us, or speak to any pastor after the service. You don't need to explain everything, and you don't need to be a member.",
  },
  {
    q: "How do I give, and where does the money go?",
    a: "There's a box at the back and an office open on weekdays. Every quarter the accounts are read out to the whole church — what came in, what went where. Ask any question you like about them.",
  },
];

export const VISIT_STEPS = [
  {
    step: "01",
    title: "Get here around 9:45",
    text: "That gives you time to arrive, find a seat you like, and settle before the singing starts. Sitting at the back is completely fine.",
  },
  {
    step: "02",
    title: "Do what feels natural",
    text: "Stand if people stand and you want to. Stay seated if you don't. There's no script for a first visit, and nobody is watching you.",
  },
  {
    step: "03",
    title: "Leave a number, or don't",
    text: "There's a card on the seat. Fill it in and someone will call you this week. Leave it blank and you can come back next Sunday just as anonymously.",
  },
];

export const VISIT_NOTES = [
  "Easy to find in Ruyenzi Sector, Kamonyi District",
  "Children are warmly welcome — just ask at the welcome desk",
  "Services and preaching in Kinyarwanda",
  "Stay after the service for fellowship and tea",
];

export const SAFETY = [
  {
    icon: "shield",
    title: "Encrypted connection",
    text: "Everything between your device and this page is encrypted.",
  },
  {
    icon: "check",
    title: "No tracking",
    text: "No analytics, no advertising cookies, no third-party scripts. None.",
  },
  {
    icon: "mail",
    title: "Messages stay with us",
    text: "What you send is read by our pastoral team and nobody else.",
  },
  {
    icon: "book",
    title: "Nothing loads from elsewhere",
    text: "Every image, font, and line of code is served from here alone.",
  },
];


/* =========================================================
   SHOAM — CONTENT FILE
   ---------------------------------------------------------
   Student Helping Organization of Malawi.
   Everything on the website is generated from this file plus
   anything added in the content studio (saved in localStorage
   until a Supabase project is connected).

   TO ADD A PROJECT / STORY / TEAM MEMBER:
   copy the shape of an item below, paste it at the TOP of the
   list, give it a unique "slug", and save.
   ========================================================= */

window.SHOAM = {

  /* ---------- ORGANISATION ---------- */
  org: {
    name: "Student Helping Organization of Malawi",
    short: "SHOAM",
    tagline: "Education is for all.",
    village: "",
    district: "Malawi",
    country: "Malawi",
    founded: "",
    description: "A student-led organisation working for Malawian students who are held back by cost, distance and a lack of practical support. SHOAM exists to make education reachable — through materials, honest information and a network of local people who refuse to leave anyone behind.",

    /* CONTACT
       Facebook and Messenger links come from the founder's public
       profile. Email/phone are left blank until the team publishes
       them; fill them in and the website shows them automatically. */
    email: "",
    phone: "",
    whatsapp: "",
    facebook: "https://web.facebook.com/profile.php?id=61554677085022",
    messenger: "https://m.me/61554677085022",
    instagram: "",
    mapQuery: "Malawi",
    address: "Malawi"
  },

  /* ---------- NAVIGATION ---------- */
  nav: [
    { label: "About", href: "about.html" },
    { label: "Projects", href: "projects.html" },
    { label: "Team", href: "team.html" },
    { label: "Stories", href: "articles.html" },
    { label: "Get involved", href: "get-involved.html" },
    { label: "Contact", href: "contact.html" }
  ],

  /* ---------- QUICK FACTS ---------- */
  stats: [
    { value: "SHOAM", label: "Student Helping Organization" },
    { value: "For all", label: "Education is for all" },
    { value: "Malawi", label: "Students in villages, towns and schools" },
    { value: "Open", label: "Join the local network" }
  ],

  /* ---------- MISSION / VISION / VALUES ---------- */
  mission: "To help students across Malawi stay in school, get the materials and information they need, and find a local community that takes their ambitions seriously.",
  vision: "A Malawi where education really is for all — where a student's future is not decided by their village, their family income or the cost of getting to school.",
  values: [
    "Education for all — the motto is the whole point, not a slogan.",
    "Student-led — Malawian students are the organisers, not the audience.",
    "Local and nationwide — we listen in communities and share what works across Malawi.",
    "Practical help — fees, books, transport and information beat speeches.",
    "Honesty — we say what we are doing, and what we are still planning."
  ],

  /* ---------- THE CHALLENGE ---------- */
  challenges: [
    {
      title: "The cost of simply turning up",
      body: "For many families, school fees, transport, uniforms and exam costs add up to a decision no child should have to make. Help that arrives early changes the whole term."
    },
    {
      title: "Learning materials are not evenly shared",
      body: "Some students have books, notebooks and a quiet place to read. Others share one exercise book with three people. Closing that gap is basic, not luxurious."
    },
    {
      title: "Distance decides too much",
      body: "A student who lives far from a secondary school or a training centre faces time, cost and safety barriers that are invisible on a map."
    },
    {
      title: "Girls face extra barriers",
      body: "Early pregnancy, period poverty, safety concerns and household expectations still push girls out of school. Support has to reach them before they leave."
    },
    {
      title: "Information arrives too late",
      body: "Many students choose subjects, courses and careers with almost no honest guidance. A short conversation at the right time can change a path."
    },
    {
      title: "No one knows where to start",
      body: "Good intentions are everywhere. What is missing is a clear place to plug in — a group that will tell you what is needed and what you can actually do."
    }
  ],

  /* ---------- HOW WE WORK ---------- */
  approach: [
    { title: "Listen", body: "We ask students, parents and schools what is actually blocking them, rather than assuming we know." },
    { title: "Share", body: "We put the need in front of the people who can help — students, alumni, businesses and well-wishers across Malawi." },
    { title: "Support", body: "School fees where we can, notebooks, transport, mentoring and introductions. Practical things with names and dates attached." },
    { title: "Follow up", body: "We check what happened, write it down honestly, and let supporters see where their help went." }
  ],

  /* ---------- TEAM ----------
     group: "leadership" | "executive" | "volunteer" | "honorary"
     featured: true → appears on the home page
     photo: path, or "" → initials are used                      */
  team: [
    {
      name: "Frank Mkhalipi",
      role: "Founder & Executive Director",
      group: "leadership",
      featured: true,
      photo: "",
      studies: "University of Malawi (UNIMA)",
      based: "Malawi",
      focus: "Making education reachable for students across Malawi.",
      bio: "Frank Mkhalipi is the founder and executive director of SHOAM — the Student Helping Organization of Malawi. His public introduction is simple: SHOAM Foundation Organization, philanthropy, entrepreneurship, and a belief that education is for all. The work is still young, and that is exactly why he is building it in the open: students across the nation are being asked to take part, not just to watch.",
      email: ""
    },
    {
      name: "Student volunteers",
      role: "The people who make it happen",
      group: "volunteer",
      featured: true,
      photo: "",
      studies: "Schools, colleges and universities across Malawi",
      based: "Across Malawi",
      focus: "Outreach, materials, mentoring and showing up.",
      bio: "SHOAM is built by students. Volunteers help reach classmates, sort and deliver materials, share honest information about school and career choices, and keep the organisation accountable to the people it serves. Names and profiles will be added here as the team grows — no invented faces, no borrowed stories.",
      email: ""
    }
  ],

  /* ---------- PROJECTS ----------
     status: "Ongoing" | "Upcoming" | "Completed"
     featured: true → home page
     photos: first photo is the cover                          */
  projects: [
    {
      slug: "national-student-outreach",
      title: "National Student Outreach",
      status: "Ongoing",
      category: "Outreach",
      featured: true,
      location: "Across Malawi",
      timeline: "Ongoing",
      lead: "SHOAM founder and volunteers",
      summary: "Reaching students across Malawi with one clear invitation: education is for all, and there is a place for you in making that true.",
      description: `SHOAM began with a public challenge to students across the nation: do you know that this organisation exists, and will you help build it?

That conversation is the first piece of work. We are using it to listen — to hear which students are missing out, what schools are short of, and who is already helping quietly in their own communities.

Outreach is not a social-media campaign for us. It is the first step towards a real network: students who know each other, know what is needed, and can act together.`,
      highlights: [
        "A call to students across Malawi",
        "Listening before designing programmes",
        "Building a nationwide contact network",
        "Regular public updates as the work grows"
      ],
      photos: [
        "assets/photos/students-hero.jpg",
        "assets/photos/students-group.jpg",
        "assets/photos/students-lecture.jpg"
      ]
    },
    {
      slug: "education-for-all-fund",
      title: "Education for All Fund",
      status: "Upcoming",
      category: "Student support",
      featured: true,
      location: "Malawi",
      timeline: "Being prepared",
      lead: "SHOAM",
      summary: "A transparent fund for the simple, unglamorous costs that keep students out of class — materials, transport and exam support.",
      description: `The motto is not abstract. "Education is for all" means a student should not drop out because they cannot afford a notebook or a bus fare to an exam centre.

We are preparing a small, carefully managed fund that will meet those costs directly and report on every kwacha. The criteria, the safeguards and the decisions will be published so that supporters can see exactly what their help did.

We are not announcing amounts we cannot stand behind. Details will appear here when the first round is ready.`,
      highlights: [
        "School fees and exam costs",
        "Notebooks, pens and textbooks",
        "Transport support where distance is the barrier",
        "Clear criteria, published in advance"
      ],
      photos: ["assets/photos/books.jpg", "assets/photos/students-desks.jpg"]
    },
    {
      slug: "school-materials-drive",
      title: "Student Materials Drive",
      status: "Upcoming",
      category: "Education",
      featured: true,
      location: "Malawi",
      timeline: "Next drive being planned",
      lead: "Open — volunteers welcome",
      summary: "Collecting and delivering notebooks, pens, textbooks and other basics to students who are learning with almost nothing.",
      description: `A bag of notebooks is not a solution to everything. But for a student who has been sharing one exercise book with two classmates, it can change the whole term.

The Student Materials Drive is our simplest idea: gather what schools and students actually ask for, sort it properly, and get it to the people who need it. No photographs of piles of books for their own sake — only deliveries that are recorded and followed up.

If you are a school, a business, a printing shop or an individual in Malawi, this is the easiest place to start helping.`,
      highlights: [
        "Notebooks, pens and textbooks",
        "Needs lists from the schools themselves",
        "Recorded deliveries and follow-up",
        "Simple ways for anyone to contribute"
      ],
      photos: ["assets/photos/students-classroom.jpg", "assets/photos/books.jpg"]
    },
    {
      slug: "student-mentorship-circles",
      title: "Student Mentorship Circles",
      status: "Upcoming",
      category: "Mentorship",
      featured: false,
      location: "Malawi",
      timeline: "Pilot being designed",
      lead: "SHOAM volunteers",
      summary: "Small groups where students can talk honestly about subjects, careers, money and the decisions that quietly shape their futures.",
      description: `Most students are asked to make big decisions with very little information. Which subjects? What after Form Four? What if the family needs you to work?

Mentorship Circles will bring students together with people a few steps ahead — university students, young professionals and teachers — for regular, practical conversations. Small enough to be honest. Consistent enough to matter.

We are designing the first pilot now and will publish what it involves before it starts.`,
      highlights: [
        "Peer and near-peer mentors",
        "Subject, course and career conversations",
        "Honest talk about money and family pressure",
        "A pilot we will describe before we run it"
      ],
      photos: ["assets/photos/students-study.jpg", "assets/photos/students-lecture.jpg"]
    },
    {
      slug: "stay-in-school-support",
      title: "Stay-in-School Support",
      status: "Upcoming",
      category: "Safeguarding",
      featured: false,
      location: "Malawi",
      timeline: "In planning",
      lead: "SHOAM",
      summary: "Early, discreet support for girls and boys at risk of leaving school — built with families and schools, not around them.",
      description: `The point at which a student leaves school is rarely sudden. Attendance slips, fees go unpaid, a girl stops coming after a term, a boy disappears to work.

Stay-in-School Support is being designed to notice that pattern early and respond practically: a conversation, a referral, materials, transport, or simply someone who checks in next week.

Any programme here will be built with safeguarding from the start. We will not publish a plan that we cannot keep safe.`,
      highlights: [
        "Early identification of students at risk",
        "Practical support, not just advice",
        "Safeguarding designed in from the beginning",
        "Work with families and schools"
      ],
      photos: ["assets/photos/students-reading.jpg", "assets/photos/students-classroom.jpg"]
    }
  ],

  /* ---------- STORIES ----------
     layout: "feature" | "interview" | "photo-essay" | "field-note"
     body: simple markdown (## heading, > quote, - list, ![caption](image), **bold**, *italic*) */
  articles: [
    {
      slug: "do-you-know-shoam",
      title: "Do you know SHOAM? A question for students across Malawi",
      standfirst: "The question we are asking everywhere — and the answer we are building together.",
      category: "Update",
      author: "SHOAM",
      date: "2026-11-17",
      layout: "feature",
      featured: true,
      cover: "assets/photos/shoam-post.jpg",
      tags: ["SHOAM", "Students", "Malawi"],
      body: `Do You Know SHOAM FOUNDATION ORGANIZATION???

That is the question we put to students across the nation. It comes from a public post by our founder, Frank Mkhalipi, and it is deliberately a little uncomfortable. An organisation only exists when the people it is for know about it and can hold it to account.

## What the name means

**SHOAM** is the Student Helping Organization of Malawi. The motto is equally plain: **education is for all**.

Not for the students in the right catchment area. Not for the ones whose families can cover every cost. For all of them.

## YANKHO LANU MA STUDENTS

The post called out to *students across the nation* in Chichewa as well as English. That was not decoration. Malawi's students are spread across towns, villages, schools and campuses, and the conversation has to reach all of them.

We are using that response to listen: what is missing, what is already working, and who is willing to help.

## This is an invitation, not a launch speech

The work is still being built. That is why we are publishing what we plan rather than pretending everything is finished. If you are a student, a teacher, a parent or a supporter, tell us what you can see that we cannot.

> Education is for all. That sentence is only worth printing if we are willing to do the work behind it.`
    },
    {
      slug: "education-is-for-all",
      title: "Education is for all — what that actually means",
      standfirst: "A motto is easy to print. Here is the practical version.",
      category: "Essay",
      author: "SHOAM",
      date: "2026-11-10",
      layout: "feature",
      featured: true,
      cover: "assets/photos/students-classroom.jpg",
      tags: ["Education", "Malawi", "SHOAM"],
      body: `Education is for all. It is the line on our page and the reason SHOAM exists. But a motto only earns its place if you can translate it into something a student can use on Monday morning.

## It means materials before speeches

For some students the barrier is a notebook. For others it is a bus fare to an exam centre. These are not small details. They are the difference between sitting the exam and not sitting it.

## It means information shared early

A student choosing subjects or a course should not have to rely on rumour. Part of our work is simply getting honest information to people before the decision is made.

## It means being counted

Students across Malawi are not a statistic to be spoken about. They are the people who should be designing the help, checking it and saying when it is not working.

## It means we publish the plan

SHOAM is still young. We will say what is ongoing, what is being planned and what we have not started. That is the only honest way to ask for trust.`
    },
    {
      slug: "students-across-the-nation",
      title: "Why students across the nation are being asked to lead",
      standfirst: "The next chapter of student support in Malawi cannot be built from one town.",
      category: "Opinion",
      author: "SHOAM",
      date: "2026-11-05",
      layout: "feature",
      featured: false,
      cover: "assets/photos/students-group.jpg",
      tags: ["Students", "Leadership", "Malawi"],
      body: `A student in Lilongwe and a student in a village classroom do not face the same timetable, the same distance or the same costs. But both are being asked to plan a future with very little support.

## One country, many barriers

That is why SHOAM is speaking to students across the nation rather than organising only around one school or campus. The problems rhyme, but they are not identical. Local voices are the only reliable guide.

## What leadership means here

It does not mean a title or a podium. It means noticing who is missing from the room, bringing them in, and doing the unglamorous follow-up afterwards.

## The invitation

If you are a student who wants to help, you do not need permission to start. Tell us what you can see, what you can do, and what would make it easier to show up. That is how this organisation gets built properly.`
    },
    {
      slug: "what-we-are-building-next",
      title: "What we are building next",
      standfirst: "A plain update on the first projects SHOAM is preparing.",
      category: "Update",
      author: "SHOAM",
      date: "2026-11-01",
      layout: "feature",
      featured: false,
      cover: "assets/photos/students-study.jpg",
      tags: ["Projects", "SHOAM", "Malawi"],
      body: `SHOAM is at the stage where the most useful thing we can publish is a clear list of what comes next.

## National Student Outreach

Already under way: asking students across Malawi to identify themselves, share what they need and join the conversation.

## Education for All Fund

Being prepared: a transparent way to meet the small costs that push students out of school. Criteria and reporting will be published before any money is handled.

## Student Materials Drive

Being planned: notebooks, pens and books, gathered against real needs lists and recorded when delivered.

## Mentorship and stay-in-school support

Still being designed. We will not describe a safeguard we have not built, or a cohort we cannot support.

If you want to help with any of these, the contact page is the place to start. Say what you can give and how often — honest offers are more useful than broad enthusiasm.`
    }
  ],

  /* ---------- WHO WE WORK WITH ---------- */
  partners: [
    "Students across Malawi",
    "Schools and teachers",
    "Universities and colleges, including UNIMA",
    "Parents and guardians",
    "Community and traditional leaders",
    "Alumni, businesses and well-wishers"
  ]
};

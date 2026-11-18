-- =========================================================
--  SHOAM - starter content (matches js/data.js)
--  Run AFTER schema.sql. Safe to run more than once.
--  Only published rows are visible to public visitors.
-- =========================================================

begin;

-- Projects
insert into public.projects (slug, title, status, category, summary, description, lead, location, timeline, highlights, photos, featured, published, sort_order) values
  ('national-student-outreach', 'National Student Outreach', 'Ongoing', 'Outreach', 'Reaching students across Malawi with one clear invitation: education is for all, and there is a place for you in making that true.', 'SHOAM began with a public challenge to students across the nation: do you know that this organisation exists, and will you help build it?

That conversation is the first piece of work. We are using it to listen — to hear which students are missing out, what schools are short of, and who is already helping quietly in their own communities.

Outreach is not a social-media campaign for us. It is the first step towards a real network: students who know each other, know what is needed, and can act together.', 'SHOAM founder and volunteers', 'Across Malawi', 'Ongoing', array['A call to students across Malawi','Listening before designing programmes','Building a nationwide contact network','Regular public updates as the work grows']::text[], array['assets/photos/students-hero.jpg','assets/photos/students-group.jpg','assets/photos/students-lecture.jpg']::text[], true, true, 0),
  ('education-for-all-fund', 'Education for All Fund', 'Upcoming', 'Student support', 'A transparent fund for the simple, unglamorous costs that keep students out of class — materials, transport and exam support.', 'The motto is not abstract. "Education is for all" means a student should not drop out because they cannot afford a notebook or a bus fare to an exam centre.

We are preparing a small, carefully managed fund that will meet those costs directly and report on every kwacha. The criteria, the safeguards and the decisions will be published so that supporters can see exactly what their help did.

We are not announcing amounts we cannot stand behind. Details will appear here when the first round is ready.', 'SHOAM', 'Malawi', 'Being prepared', array['School fees and exam costs','Notebooks, pens and textbooks','Transport support where distance is the barrier','Clear criteria, published in advance']::text[], array['assets/photos/books.jpg','assets/photos/students-desks.jpg']::text[], true, true, 1),
  ('school-materials-drive', 'Student Materials Drive', 'Upcoming', 'Education', 'Collecting and delivering notebooks, pens, textbooks and other basics to students who are learning with almost nothing.', 'A bag of notebooks is not a solution to everything. But for a student who has been sharing one exercise book with two classmates, it can change the whole term.

The Student Materials Drive is our simplest idea: gather what schools and students actually ask for, sort it properly, and get it to the people who need it. No photographs of piles of books for their own sake — only deliveries that are recorded and followed up.

If you are a school, a business, a printing shop or an individual in Malawi, this is the easiest place to start helping.', 'Open — volunteers welcome', 'Malawi', 'Next drive being planned', array['Notebooks, pens and textbooks','Needs lists from the schools themselves','Recorded deliveries and follow-up','Simple ways for anyone to contribute']::text[], array['assets/photos/students-classroom.jpg','assets/photos/books.jpg']::text[], true, true, 2),
  ('student-mentorship-circles', 'Student Mentorship Circles', 'Upcoming', 'Mentorship', 'Small groups where students can talk honestly about subjects, careers, money and the decisions that quietly shape their futures.', 'Most students are asked to make big decisions with very little information. Which subjects? What after Form Four? What if the family needs you to work?

Mentorship Circles will bring students together with people a few steps ahead — university students, young professionals and teachers — for regular, practical conversations. Small enough to be honest. Consistent enough to matter.

We are designing the first pilot now and will publish what it involves before it starts.', 'SHOAM volunteers', 'Malawi', 'Pilot being designed', array['Peer and near-peer mentors','Subject, course and career conversations','Honest talk about money and family pressure','A pilot we will describe before we run it']::text[], array['assets/photos/students-study.jpg','assets/photos/students-lecture.jpg']::text[], false, true, 3),
  ('stay-in-school-support', 'Stay-in-School Support', 'Upcoming', 'Safeguarding', 'Early, discreet support for girls and boys at risk of leaving school — built with families and schools, not around them.', 'The point at which a student leaves school is rarely sudden. Attendance slips, fees go unpaid, a girl stops coming after a term, a boy disappears to work.

Stay-in-School Support is being designed to notice that pattern early and respond practically: a conversation, a referral, materials, transport, or simply someone who checks in next week.

Any programme here will be built with safeguarding from the start. We will not publish a plan that we cannot keep safe.', 'SHOAM', 'Malawi', 'In planning', array['Early identification of students at risk','Practical support, not just advice','Safeguarding designed in from the beginning','Work with families and schools']::text[], array['assets/photos/students-reading.jpg','assets/photos/students-classroom.jpg']::text[], false, true, 4)
on conflict (slug) do nothing;

-- Team
insert into public.members (name, role, team_group, studies, based, focus, bio, quote, email, photo, featured, published, sort_order)
select * from (values
  ('Frank Mkhalipi', 'Founder & Executive Director', 'leadership', 'University of Malawi (UNIMA)', 'Malawi', 'Making education reachable for students across Malawi.', 'Frank Mkhalipi is the founder and executive director of SHOAM — the Student Helping Organization of Malawi. His public introduction is simple: SHOAM Foundation Organization, philanthropy, entrepreneurship, and a belief that education is for all. The work is still young, and that is exactly why he is building it in the open: students across the nation are being asked to take part, not just to watch.', '', '', '', true, true, 0),
  ('Student volunteers', 'The people who make it happen', 'volunteer', 'Schools, colleges and universities across Malawi', 'Across Malawi', 'Outreach, materials, mentoring and showing up.', 'SHOAM is built by students. Volunteers help reach classmates, sort and deliver materials, share honest information about school and career choices, and keep the organisation accountable to the people it serves. Names and profiles will be added here as the team grows — no invented faces, no borrowed stories.', '', '', '', true, true, 1)
) as v(name, role, team_group, studies, based, focus, bio, quote, email, photo, featured, published, sort_order)
where not exists (select 1 from public.members m where lower(m.name) = lower(v.name));

-- Stories
insert into public.articles (slug, title, standfirst, category, author, date, layout, cover, tags, body, featured, published, sort_order) values
  ('do-you-know-shoam', 'Do you know SHOAM? A question for students across Malawi', 'The question we are asking everywhere — and the answer we are building together.', 'Update', 'SHOAM', '2026-11-17'::date, 'feature', 'assets/photos/shoam-post.jpg', array['SHOAM','Students','Malawi']::text[], 'Do You Know SHOAM FOUNDATION ORGANIZATION???

That is the question we put to students across the nation. It comes from a public post by our founder, Frank Mkhalipi, and it is deliberately a little uncomfortable. An organisation only exists when the people it is for know about it and can hold it to account.

## What the name means

**SHOAM** is the Student Helping Organization of Malawi. The motto is equally plain: **education is for all**.

Not for the students in the right catchment area. Not for the ones whose families can cover every cost. For all of them.

## YANKHO LANU MA STUDENTS

The post called out to *students across the nation* in Chichewa as well as English. That was not decoration. Malawi''s students are spread across towns, villages, schools and campuses, and the conversation has to reach all of them.

We are using that response to listen: what is missing, what is already working, and who is willing to help.

## This is an invitation, not a launch speech

The work is still being built. That is why we are publishing what we plan rather than pretending everything is finished. If you are a student, a teacher, a parent or a supporter, tell us what you can see that we cannot.

> Education is for all. That sentence is only worth printing if we are willing to do the work behind it.', true, true, 0),
  ('education-is-for-all', 'Education is for all — what that actually means', 'A motto is easy to print. Here is the practical version.', 'Essay', 'SHOAM', '2026-11-10'::date, 'feature', 'assets/photos/students-classroom.jpg', array['Education','Malawi','SHOAM']::text[], 'Education is for all. It is the line on our page and the reason SHOAM exists. But a motto only earns its place if you can translate it into something a student can use on Monday morning.

## It means materials before speeches

For some students the barrier is a notebook. For others it is a bus fare to an exam centre. These are not small details. They are the difference between sitting the exam and not sitting it.

## It means information shared early

A student choosing subjects or a course should not have to rely on rumour. Part of our work is simply getting honest information to people before the decision is made.

## It means being counted

Students across Malawi are not a statistic to be spoken about. They are the people who should be designing the help, checking it and saying when it is not working.

## It means we publish the plan

SHOAM is still young. We will say what is ongoing, what is being planned and what we have not started. That is the only honest way to ask for trust.', true, true, 1),
  ('students-across-the-nation', 'Why students across the nation are being asked to lead', 'The next chapter of student support in Malawi cannot be built from one town.', 'Opinion', 'SHOAM', '2026-11-05'::date, 'feature', 'assets/photos/students-group.jpg', array['Students','Leadership','Malawi']::text[], 'A student in Lilongwe and a student in a village classroom do not face the same timetable, the same distance or the same costs. But both are being asked to plan a future with very little support.

## One country, many barriers

That is why SHOAM is speaking to students across the nation rather than organising only around one school or campus. The problems rhyme, but they are not identical. Local voices are the only reliable guide.

## What leadership means here

It does not mean a title or a podium. It means noticing who is missing from the room, bringing them in, and doing the unglamorous follow-up afterwards.

## The invitation

If you are a student who wants to help, you do not need permission to start. Tell us what you can see, what you can do, and what would make it easier to show up. That is how this organisation gets built properly.', false, true, 2),
  ('what-we-are-building-next', 'What we are building next', 'A plain update on the first projects SHOAM is preparing.', 'Update', 'SHOAM', '2026-11-01'::date, 'feature', 'assets/photos/students-study.jpg', array['Projects','SHOAM','Malawi']::text[], 'SHOAM is at the stage where the most useful thing we can publish is a clear list of what comes next.

## National Student Outreach

Already under way: asking students across Malawi to identify themselves, share what they need and join the conversation.

## Education for All Fund

Being prepared: a transparent way to meet the small costs that push students out of school. Criteria and reporting will be published before any money is handled.

## Student Materials Drive

Being planned: notebooks, pens and books, gathered against real needs lists and recorded when delivered.

## Mentorship and stay-in-school support

Still being designed. We will not describe a safeguard we have not built, or a cohort we cannot support.

If you want to help with any of these, the contact page is the place to start. Say what you can give and how often — honest offers are more useful than broad enthusiasm.', false, true, 3)
on conflict (slug) do nothing;

commit;

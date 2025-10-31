import { Injectable } from '@nestjs/common';

export interface Letter {
  id: number;
  title: string;
  content: string;
  book: 'awakening' | 'foundation' | 'arsenal' | 'revolution';
  order: number;
  prerequisites: number[];
  unlocks: string[];
  estimatedReadTime: number;
  isUnlocked: boolean;
}

@Injectable()
export class LettersService {
  private letters: Letter[] = [
    {
      id: 1,
      title: "You've Been Played",
      content: `<p>Dear Friend,</p>
<p>Welcome to the beginning of your journey. If you're reading this, something inside you is stirring—a quiet doubt, a nagging question about the world around you. You've sensed that things aren't quite right, that the narratives fed to us through screens and speeches don't add up. Let me be blunt: you've been played. We all have. The systems we live under—governments, corporations, media—thrive on deception, weaving lies so seamlessly into our reality that we accept them as truth. But once you see the patterns, you can't unsee them. This letter is your first step toward breaking free.</p>
<p>Let's start with history, because the past isn't just prologue; it's a blueprint for the present. Consider Watergate in the 1970s: President Nixon's administration broke into the Democratic National Committee headquarters, spied on opponents, and covered it up with a web of lies. When the truth emerged through leaked tapes, it exposed not just one man's paranoia but a systemic rot where power protects itself at all costs. Or take Iran-Contra in the 1980s: The Reagan administration secretly sold arms to Iran (despite an embargo) to fund Nicaraguan rebels, bypassing Congress and lying to the public. High-ranking officials were indicted, but the machine rolled on, unscathed in its core.</p>
<p>Go further back to the Pentagon Papers in 1971: These classified documents, leaked by Daniel Ellsberg, revealed how multiple U.S. administrations—from Truman to Nixon—had systematically lied about the Vietnam War, escalating involvement while knowing it was unwinnable. Thousands died for a fabricated narrative of "containment" and "democracy." Then there's COINTELPRO, the FBI's covert program from 1956 to 1971, aimed at disrupting civil rights and anti-war groups. They infiltrated organizations like the Black Panthers, spread disinformation, and even assassinated leaders like Fred Hampton—all under the guise of national security.</p>
<p>And we can't ignore 9/11: The attacks were exploited to justify endless wars, surveillance states, and the Patriot Act, eroding civil liberties in the name of safety. Intelligence failures (or manipulations) led to invasions based on false claims of weapons of mass destruction in Iraq, costing trillions and countless lives.</p>
<p>These aren't isolated incidents; they're patterns of systemic manipulation. Governments and the powerful elite craft crises or exaggerate threats to consolidate control, divert attention, and maintain the status quo. They rely on our ignorance—our busy lives, our trust in authority—to keep us compliant. Ignorance is their greatest ally; it keeps the masses divided, distracted, and docile. But knowledge? Knowledge is power. It reveals the strings of the puppet show, showing how economic interests, media spin, and political theater work together to keep you in the dark.</p>
<p>The choice is yours: Stay in the comfort of illusion, or embrace the discomfort of truth. Knowledge demands action; it pulls you from spectator to participant. As you reflect on these historical deceptions, ask yourself: What lies are being told today? In the letters ahead, we'll peel back more layers. But for now, recognize the game—and decide you're done being played.</p>
<p>Onward,</p>
<p>Anthony</p>`,
      book: 'awakening',
      order: 1,
      prerequisites: [],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: true
    },
    {
      id: 2,
      title: "Follow the Money",
      content: `<p>Dear Friend,</p>
<p>You’ve seen the lies. Now let’s trace where they come from—and where they lead.</p>
<p>Every deception you uncovered in the last letter had one thing in common: money. Not just cash in pockets, but rivers of it flowing through politics, media, and policy like blood through a living organism. If you want to understand power, stop listening to speeches. Follow the money.</p>
<p>Start with the Supreme Court’s 2010 Citizens United decision. Five justices ruled that corporations are people and money is speech. Overnight, billionaires and multinational conglomerates gained the legal right to drown elections in anonymous donations. Super PACs exploded. A single donor—Sheldon Adelson, the Koch brothers, George Soros, take your pick—can now outspend an entire city’s voters. Democracy didn’t die in darkness; it drowned in dark money.</p>
<p>Walk into Washington, D.C. today and you’ll find over 11,000 registered lobbyists—that’s more than 20 for every member of Congress. They don’t knock on doors; they own the buildings. Pharmaceutical companies spent $375 million lobbying in 2023 alone to keep drug prices sky-high. Oil giants funnel hundreds of millions to block climate legislation. These aren’t bribes in briefcases—they’re legalized influence, wrapped in think-tank reports and campaign contributions.</p>
<p>Now look at the media you consume. Six corporations control 90% of what you see, hear, and read: Disney, Comcast, Warner Bros. Discovery, Paramount, News Corp, and Sony. Their boards interlock with the same banks, hedge funds, and defense contractors that profit from war and deregulation. When a story threatens their bottom line—say, exposing Pfizer’s price gouging or Boeing’s safety failures—it gets buried under celebrity scandals and culture-war bait.</p>
<p>Then there’s the think-tank industrial complex. Outfits like the Heritage Foundation, Brookings, or the Cato Institute sound scholarly, but they’re funded by the same donors who write the checks to politicians. Their “research” isn’t neutral—it’s weaponized policy, laundered through academic prestige to justify tax cuts for the rich or deregulation for polluters.</p>
<p>And don’t forget the revolving door. Watch a regulator at the FDA approve a sketchy drug, then take a seven-figure job at the same pharma company six months later. See a general push for war on TV, then join the board of a defense contractor. This isn’t corruption by accident—it’s the system working as designed.</p>
<p>The money doesn’t just buy policy. It buys silence. It buys narratives. It buys you—through the ads you see, the news you trust, the candidates you’re allowed to choose from.</p>
<p>But here’s the secret they don’t want you to know: money only has power because we let it. Every dollar in a campaign chest, every lobbyist’s expense account, every media merger—it all depends on a system we keep running by playing along.</p>
<p>In the next letter, we’ll see how this rigged financial game hardens into a political machine that crushes anyone who threatens it. But for now, remember:</p>
<p>The truth isn’t hidden. It’s bought.</p>
<p>Keep your eyes open,</p>
<p>Anthony</p>`,
      book: 'awakening',
      order: 2,
      prerequisites: [1],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 3,
      title: "The Rigged Game",
      content: `<p>Dear Friend,</p>
<p>You’ve followed the money. Now watch how it locks the doors and tilts the table so the same players always win.</p>
<p>The system isn’t broken—it’s rigged by design, and every rule is written to protect the house.</p>
<p>Start with gerrymandering. Politicians don’t just run in districts; they draw them. Using AI-powered software, they slice neighborhoods like pizza to pack opponents into a few safe seats and spread their own voters across the rest. In North Carolina, Republicans drew maps so precise that they won 10 of 13 congressional seats with only 50% of the vote. In Maryland, Democrats did the same. The result? Your vote only counts if you live in the right-shaped box.</p>
<p>Then there’s voter suppression—quiet, legal, and relentless. In Georgia, Texas, and Florida, new laws close polling places in Black and Latino neighborhoods, purge voter rolls with surgical precision, and demand IDs that millions don’t have. They call it “election integrity.” It’s disenfranchisement with a smile. Between 2016 and 2020, over 20 million Americans were removed from voter lists—mostly in low-income and minority areas.</p>
<p>Now look at the Electoral College, a relic from 1787 when slave states wanted extra power. Today, a voter in Wyoming has 3.6 times the electoral weight of a voter in California. In 2000 and 2016, the loser of the popular vote became president. The message is clear: Your voice matters—unless you live in the wrong state.</p>
<p>The Senate is even worse. Two senators per state, no matter the population. California (40 million people) gets the same voice as Wyoming (580,000). That means 70 million Americans in the biggest states are silenced so a minority in rural strongholds can block healthcare, climate action, or gun reform. It’s not representation—it’s structural minority rule.</p>
<p>And the Supreme Court? Once a check on power, now a crown jewel of capture. Lifetime appointments mean one party can stack the bench for decades. After Trump appointed three justices, the Court gutted voting rights, overturned Roe v. Wade, and green-lit unlimited corporate cash in politics. Six unelected justices now override the will of 330 million people.</p>
<p>Finally, corporate capture seals the deal. Agencies like the FCC, EPA, and SEC aren’t regulating industries—they’re run by them. Lobbyists write the rules. CEOs become cabinet secretaries. The FDA approves drugs that kill. The FAA certifies planes that crash. The system doesn’t fail—it succeeds for the few.</p>
<p>This isn’t democracy. It’s oligarchy with extra steps.</p>
<p>The game is rigged from the ballot box to the boardroom. But here’s the truth they fear:</p>
<p>A rigged game can still be flipped—if enough players wake up and refuse to play.</p>
<p>Next, we’ll see what happens when someone actually threatens the table—like Bernie Sanders.</p>
<p>Spoiler: They don’t let him sit down.</p>
<p>Stay sharp,</p>
<p>Anthony</p>`,
      book: 'awakening',
      order: 3,
      prerequisites: [2],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 4,
      title: "What They Did to Berni",
      content: `<p>Dear Friend,</p>
<p>You’ve seen the rigged game. Now meet the player who dared to challenge it—and how the establishment crushed him. Bernie Sanders wasn’t a radical; he was a mirror reflecting the rot. His 2016 and 2020 campaigns exposed what happens when a genuine threat emerges: the machine activates, not with tanks, but with coordinated sabotage.</p>
<p>Start with the media blackout. In 2016, Sanders surged from nowhere, drawing massive crowds and winning primaries. But coverage? CNN, MSNBC, and the New York Times treated him like a footnote. A study by FAIR found Sanders received just 10% of the airtime that Hillary Clinton got during key months. When he spoke truth about income inequality or Medicare for All, anchors pivoted to horse-race trivia or dismissed him as "unelectable." Fox News barely mentioned him unless to smear. Why? Ownership ties: Comcast (MSNBC) lobbies for telecom monopolies; Disney (ABC) profits from the status quo. Bernie threatened their sponsors' bottom lines, so he got erased from the script.</p>
<p>Then came the DNC manipulation. The Democratic National Committee, meant to be neutral, rigged the rules. Superdelegates—party insiders like governors, donors, and elites—held 15% of the votes, unbound by primaries. In 2016, they pledged en masse to Clinton before a single vote was cast, creating an illusion of inevitability. Leaked DNC emails confirmed the bias: Chair Debbie Wasserman Schultz called Sanders' team "a bunch of assholes" and plotted to undermine him. The joint fundraising agreement funneled Sanders' small-dollar donations to Clinton's machine. When he won states like Michigan by landslides, the DNC buried the results under superdelegate math. By 2020, they tweaked rules again, but the damage was done—Bernie suspended, not defeated.</p>
<p>Corporate pressure sealed it. Wall Street donors, who poured $1.5 billion into Clinton's coffers, coordinated blackouts and smears. Think tanks funded by billionaires flooded op-eds with warnings of Bernie's "socialism." Establishment Democrats like Pelosi and Schumer whispered to donors: Back us, or watch your taxes rise. Even after Bernie endorsed Clinton, the party ignored his platform, opting for incrementalism that preserved corporate power.</p>
<p>This is the establishment response to progressive threats: Co-opt, marginalize, or destroy. Sanders proved the system works—millions mobilized, but the rules bent back. He wasn't perfect, but he forced the conversation on wealth gaps and healthcare. Yet the machine adapted, learning to preempt outsiders with purity tests and donor vetoes.</p>
<p>Bernie showed us the blueprint for resistance—and how it's neutralized. But next, we'll dissect the media's role deeper, because without their lies, the game couldn't hide.</p>
<p>The fight isn't over.</p>
<p>Anthony</p>`,
      book: 'awakening',
      order: 4,
      prerequisites: [3],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 5,
      title: "Corporate Media's Lies",
      content: `<p>Dear Friend,</p>
<p>Bernie's blackout wasn't random—it was corporate media doing what it does best: protecting power. But forget left or right; media bias isn't ideological. It's structural, wired to serve the elite who own the airwaves. The press isn't your watchdog; it's the lapdog of those who pay its bills.</p>
<p>At the core is corporate media monopoly. Six conglomerates—AT&T (now Warner Bros. Discovery), Comcast, Disney, Paramount, News Corp, and Sony—control 90% of U.S. media. They own the networks, studios, newspapers, and streaming services. Conflicts of interest abound: Disney lobbies against antitrust while producing "progressive" films; Comcast fights net neutrality to throttle competitors. Consolidation means one story line dominates, sanitized for shareholder value.</p>
<p>Advertising revenue pulls the strings. Pharma ads alone make up 75% of prime-time TV commercials, funding shows that never question drug pricing or opioid epidemics. In 2023, drug companies spent $6.5 billion on ads—more than the entire federal budget for public broadcasting. Networks chase eyeballs, not truth; sensationalism sells, nuance doesn't. When coverage threatens advertisers—like exposing ExxonMobil's climate lies—it's buried.</p>
<p>Enter access journalism: Reporters trade independence for scoops from insiders. Embed with the Pentagon, get "exclusive" war footage; criticize, and doors slam. This breeds false equivalence, where a fringe denier's claim gets equal airtime to 99 scientists. Climate change? "Both sides." Election denial? "Debate." It dilutes reality, making absurdity mainstream.</p>
<p>Coverage prioritizes horse race over substance: Who’s winning polls, not what policies mean. In 2020, endless Trump-Biden drama drowned out discussions of inequality or endless wars. Voters get spectacle, not solutions—keeping the public distracted and divided.</p>
<p>Corporate capture completes the loop. Newsrooms are run by executives from the same boardrooms they report on. Jeff Bezos owns The Washington Post, shaping coverage to favor Amazon's empire. Sinclair Broadcast Group forces local anchors to parrot right-wing scripts. Editors prioritize clicks over facts, algorithms amplify outrage.</p>
<p>Media isn't neutral; it's a profit machine aligned with power. It frames threats to the status quo as extremism, while normalizing inequality and endless profit. But cracks show: Independent voices online bypass the gatekeepers, proving the old model fragile.</p>
<p>Next, we'll uncover the real conspiracies—not tinfoil, but documented takeovers hiding in plain sight.</p>
<p>Question everything you watch,</p>
<p>Anthony</p>`,
      book: 'awakening',
      order: 5,
      prerequisites: [4],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 6,
      title: "The Real Conspiracies",
      content: `<p>Dear Friend,</p>
<p>You’ve seen the blackout, the blackout’s owners, and the blackout’s playbook. Now let’s name what’s happening in daylight: conspiracies so open they’re printed in the Federal Register. These aren’t theories; they’re documented, legal, and ongoing. The only thing “hidden” is how normal we’ve been trained to accept them.</p>
<p>Corporate capture of government</p>
<p>Every regulatory agency is now a revolving-door hiring fair. In 2022, 67% of departing FCC commissioners took telecom jobs within a year. The EPA’s top pesticide regulator left for a $1.2 million gig at Corteva—the same company whose chemicals he’d “approved.” Congress passes 400-page bills written by K Street lobbyists, then votes without reading them. This isn’t corruption; it’s institutionalized collusion.</p>
<p>Regulatory capture and the revolving door</p>
<p>The FDA’s drug-approval division is staffed by ex-pharma execs who green-light their old products, then cash out. Boeing self-certified the 737 MAX under FAA oversight—until two planes fell from the sky. The SEC lets Wall Street write its own fines. The game: regulate in name, deregulate in practice.</p>
<p>Think-tank industrial complex</p>
<p>Heritage, Cato, Brookings, AEI—names that sound objective. Funding: Koch, Exxon, Pfizer, Goldman Sachs. Their “studies” become talking points, op-eds, and eventually law. A 2023 report on tax cuts for the rich? Paid for by billionaires who save billions. Policy laundering, academic edition.</p>
<p>Media, academic, and nonprofit capture</p>
<p>Universities take oil money for “climate research” that downplays warming. NPR’s largest donor? The Gates Foundation, which shapes global health narratives. Museums host galas for arms dealers. Even charities push corporate agendas under the banner of “philanthropy.”</p>
<p>Foundation capture and corporate philanthropy</p>
<p>The Rockefeller Foundation funds “sustainable agriculture” while owning Monsanto stock. Gates pushes patented vaccines and GMO seeds in Africa, then profits when governments buy in. Charity as control.</p>
<p>And yes, 9/11—an inside job by the Republicans because they were in office.</p>
<p>The official story collapses under its own weight:</p>
<p>Building 7 fell at free-fall speed, never hit by a plane.</p>
<p>The 9/11 Commission admitted it was “set up to fail.”</p>
<p>Cheney’s Energy Task Force mapped Iraqi oil fields before the attacks.</p>
<p>The Patriot Act was ready on Bush’s desk within weeks—hundreds of pages no one could have written overnight. They needed a “new Pearl Harbor” (PNAC, 2000). They got it. Result: two decades of war, trillions in profit for Halliburton and Blackwater, and a surveillance state that watches you, not them.</p>
<p>These aren’t secrets whispered in basements. They’re minutes from board meetings, FOIA documents, and congressional records. The conspiracy is the system itself—open, proud, and untouchable.</p>
<p>Next, you choose: stay asleep in the comfort of “that’s just how it is,” or wake up and carry the weight of knowing.</p>
<p>The red pill is bitter. But it’s real.</p>
<p>Anthony</p>`,
      book: 'awakening',
      order: 6,
      prerequisites: [5],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 7,
      title: "Your Choice",
      content: `<p>Dear Friend,</p>
<p>You've journeyed through the shadows now—the lies, the money trails, the rigged rules, the crushed challengers, the media veil, and the conspiracies etched in plain view. The scales have tipped. You can't pretend anymore. The world isn't random chaos; it's a calculated cage, built to keep you docile and divided. But here's the fork in the road: your choice.</p>
<p>One path is the comfortable lie. Stay asleep. Scroll the feeds, binge the shows, vote the lesser evil, and whisper "that's just how it is." It's easy—warm like a blanket over your eyes. No hard questions, no sleepless nights wondering who profits from your pain. The system rewards sleepwalkers: distractions, debts, and dopamine hits to numb the edges. Billions walk it daily, chasing illusions of security in a game stacked against them. Why wake? The dream feels real enough.</p>
<p>The other path? Waking up. It's raw, relentless, uncomfortable. Truth strips away the myths, leaving you face-to-face with the machine's machinery. You'll see the strings everywhere—in policies that favor the few, in "news" that pacifies, in daily grinds that enrich elites while you scrape by. Awakening demands you question everything: your job, your votes, your silence. It isolates at first—friends call you cynical, family changes the subject. But it frees. No more gaslighting yourself into compliance.</p>
<p>The price of awakening is steep: time to learn, energy to resist, courage to speak. You'll lose illusions, maybe relationships, and the easy path. But gain? Clarity, purpose, allies who see the same fire. Knowledge isn't passive; it's responsibility. Once you know the game is fixed, staying neutral makes you complicit. Ignorance excuses inaction; awareness demands it.</p>
<p>Here's the power they fear: choice is action. You decide if lies rule you or if you rewrite the script. Every awakened mind tips the balance—networks form, questions spread, cracks widen. You're not powerless; the system is fragile, held by consent. Withdraw yours, and it trembles.</p>
<p>Book 2 awaits: The Foundation. We'll build from here—find your fight, start small, know your foes. But only if you choose to step forward.</p>
<p>The truth sets you free. What will you do with it?</p>
<p>Yours in the fight,</p>
<p>Anthony</p>`,
      book: 'awakening',
      order: 7,
      prerequisites: [6],
      unlocks: ['join_existing_revolts'],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 8,
      title: "Finding Your Fight",
      content: `<p>Dear Awakened Friend,</p>
<p>You’ve chosen truth. Now the real work begins: turning anger into action without burning out.</p>
<p>The system wants you scattered, furious at everything, exhausted by everything. That’s how it wins. This letter is your compass—how to find your fight and keep it.</p>
<p>Burnout is the first trap.</p>
<p>Activists crash when they try to fix the world in a weekend. Climate, healthcare, war, racism, poverty—each is a hydra. Chase every head and you’re drained before you strike. The secret? Energy is finite. Focus is force.</p>
<p>The power of focus over scattered energy</p>
<p>A laser cuts steel; sunlight warms skin. Same energy, different concentration. Pick one issue that keeps you up at night—not because it’s the only one, but because it’s yours. Maybe it’s the hospital bills that bankrupted your family. Maybe it’s the factory poisoning your river. Maybe it’s the prison pipeline swallowing your community. Personal connection is jet fuel. It turns abstract outrage into unbreakable drive.</p>
<p>Strategic choice of battles</p>
<p>Not all fights are equal. Ask three questions:</p>
<p>Can I win? (Start small, win often.)</p>
<p>Does it scale? (Local victories teach tactics that go national.)</p>
<p>Does it hurt them? (Target pressure points—money, reputation, legitimacy.) A school board banning books? Fight there. A senator taking oil cash? Expose it. Winnable, visible, painful.</p>
<p>Community and long-term commitment</p>
<p>Your fight isn’t solo. Find the others already in the trenches—parents at PTA meetings, workers on lunch breaks, neighbors at town halls. Shared struggle builds unbreakable bonds. This isn’t a sprint; it’s a relay. Train successors, document wins, pass the torch.</p>
<p>Action step (your first real one):</p>
<p>Sit with a pen and paper. Write the issue that infuriates and energizes you. Circle the people already affected. Underline the decision-maker with power to change it. That’s your battlefield.</p>
<p>The revolution doesn’t need a million martyrs. It needs a million specialists, each mastering one crack in the wall until the whole thing crumbles.</p>
<p>Next letter: Start Where You Are. No permission, no funding, no perfect moment—just you, today, right now.</p>
<p>Choose your fight.</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 8,
      prerequisites: [7],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 9,
      title: "Start Where You Are",
      content: `<p>Dear Focused Fighter,</p>
<p>You've picked your battle. Now the system whispers excuses: "Wait for the perfect plan. Get permission. Raise millions first." That's the permission problem—the myth that revolution needs a hall pass from the powerful. It doesn't. No one grants you the right to resist; you take it.</p>
<p>The perfect moment is a myth, too. History's changemakers didn't wait for ideal conditions. Rosa Parks didn't poll for approval; she sat down on a bus. The Stonewall rioters didn't fundraise—they fought back in a bar. Timing is now, because delay is surrender. The machine thrives on procrastination; it counts on you scrolling instead of acting.</p>
<p>Start where you are. Your neighborhood, workplace, community—these are your front lines. The grocery store where prices soar, the town hall where decisions get rubber-stamped, the office where bosses squeeze overtime without pay. Local power is tangible: a school board meeting, a city council vote, a union drive. Disrupt there, and ripples spread. A neighborhood watch against predatory landlords becomes a tenants' union. A workplace gripe session evolves into a strike fund.</p>
<p>Use what you have—resources and skills already in your toolkit. No budget? Leverage free tools: social media for calls to action, libraries for research, sidewalks for flyering. Your skills? If you're a teacher, educate on the issues. A mechanic? Fix bikes for community rides to protests. A parent? Organize playdates that double as strategy sessions. Creativity trumps cash every time. Barter time with allies; share rides, meals, ideas.</p>
<p>This is local revolution as foundation. Big changes—overthrowing corporate rule, rewriting laws—build from ground up. National movements falter without roots; they get co-opted or starved. But a hundred small wins compound: one park reclaimed, one corrupt official shamed, one community fed. You're not waiting for saviors; you're becoming one, block by block.</p>
<p>Next: "Know Your Enemy." Mapping the real power holders, because shadows hide, but they can be dragged into the light.</p>
<p>No more waiting. Act today.</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 9,
      prerequisites: [8],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 10,
      title: "Know Your Enemy",
      content: `<p>Dear Local Revolutionary,</p>
<p>You’re acting where you stand. Good.</p>
<p>Now aim your fire. Random rage scatters; precision destroys.</p>
<p>This letter is your map: who really runs your world, and why.</p>
<p>Power structure analysis</p>
<p>Forget the mayor’s smiling face on the billboard. Elected officials are middle management. The real boardroom sits elsewhere.</p>
<p>Who signs the paychecks?</p>
<p>Who funds the campaigns?</p>
<p>Who writes the zoning laws, the contracts, the regulations? Follow the money, the favors, the fear.</p>
<p>Real power players (not elected officials)</p>
<p>Local oligarchs – the developer who owns half the downtown, the hospital CEO who sets prices, the factory owner who poisons the river.</p>
<p>Appointed gatekeepers – zoning board chairs, police chiefs, school superintendents. They serve at the pleasure of the oligarchs, not you.</p>
<p>Hidden influencers – chamber of commerce presidents, real-estate PACs, union-busting law firms. They never run for office; they buy the winners.</p>
<p>Motivation factors</p>
<p>Three levers move every enemy:</p>
<p>Money – protect it, grow it, hide it.</p>
<p>Fear – of exposure, lawsuits, boycotts, shame.</p>
<p>Status – reputation in country clubs, board seats, Rotary speeches. Hit one, you rattle them. Hit all three, you break them.</p>
<p>Knowledge as power</p>
<p>Sunlight is the best disinfectant. Dig:</p>
<p>Campaign finance filings (OpenSecrets, state portals)</p>
<p>Property records (county clerk websites)</p>
<p>Meeting minutes, contracts, emails (FOIA requests)</p>
<p>Social media, charity galas, golf club memberships One hour of research can reveal who owns whom.</p>
<p>Action requirement</p>
<p>No intel without intent. Map your target:</p>
<p>Name the decision-maker (person, not office).</p>
<p>List their pressure points (revenue stream, upcoming election, kid’s private school).</p>
<p>Find the leverage (a permit renewal, a whistleblower, a viral video).</p>
<p>Example: Your city council votes to sell public land to a luxury developer.</p>
<p>Enemy: Councilmember Jane Doe.</p>
<p>Money: $50k from developer PAC.</p>
<p>Fear: Re-election in 18 months, thin margin.</p>
<p>Status: Chairs the “Downtown Beautification” committee. Leverage: Pack the next meeting with residents holding signs of their flooded homes. Leak the donation list to local press. Threaten recall petition.</p>
<p>Know them better than they know themselves.</p>
<p>Next letter: The 1% vs Everyone. How wealth is weaponized to keep the 99% fighting each other while the vault stays locked.</p>
<p>Your enemy has a face.</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 10,
      prerequisites: [9],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 11,
      title: "The 1% vs Everyone",
      content: `<p>Dear Mapped-Out Rebel,</p>
<p>You know your enemies now—the faces behind the facade. But zoom out: this isn't random villains; it's class warfare, engineered for one side to win every time. The 1% aren't lucky; they've designed a system that concentrates wealth upward like gravity inverted. You're the counterforce—if you unite.</p>
<p>The design of the wealth concentration system is no accident. Post-WWII prosperity built a middle class through unions, fair taxes, and regulations. Then came the counter-revolution: Reagan-Thatcher deregulation, NAFTA offshoring, and the gig economy. Today, algorithms match you to low-wage jobs while CEOs extract billions. Stock buybacks (legalized theft) let execs pump shares, cash out, and leave workers with crumbs. The top 1% owns more than the bottom 90% combined—$50 trillion vs. scraps. It's a pyramid scheme where the base erodes to build the peak.</p>
<p>Exploitation hits on three fronts:</p>
<p>Labor – Wages stagnate while productivity soars. You work harder for the same pay; bosses pocket the difference. Amazon warehouses track your every step, firing for bathroom breaks. Unions crushed, strikes demonized.</p>
<p>Consumer – Predatory pricing, planned obsolescence, data mining. Your phone spies, your credit card fees compound, your "choices" funnel profits to monopolies.</p>
<p>Tax – The rich pay 8% effective rates via loopholes; you pay 22%. Offshore havens hide trillions. Corporate welfare: bailouts for banks, subsidies for oil—your taxes fund their yachts.</p>
<p>This breeds the dependency trap: Debt for education, housing, health keeps you chained—working two jobs, fearing job loss. Miss a payment, credit tanks, opportunities vanish. The 1% thrives on your desperation; resistance feels impossible.</p>
<p>But here's their nightmare: the power of the 99% through solidarity. History proves it—labor strikes birthed weekends, civil rights marches toppled Jim Crow. Divided, you lose; united, you're unstoppable. Boycotts bankrupt brands; mass non-compliance crashes systems. The 99% has numbers, endurance, the moral high ground. They have money, but we have the streets, the factories, the votes—if mobilized.</p>
<p>Resistance starts with refusal: Share resources, form co-ops, demand audits. Solidarity isn't charity; it's strategy. Break the trap by building parallel power—community gardens over corporate food, mutual aid over banks.</p>
<p>Next: "Corporate Capture." How the 1% doesn't just hoard—they hijack the state itself.</p>
<p>You're the many. Act like it.</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 11,
      prerequisites: [10],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 12,
      title: "Corporate Capture",
      content: `<p>Dear United Front,</p>
<p>You've mapped the class war, seen the 1% hoard and exploit. But their true fortress isn't vaults—it's institutions we built for the public good, now hijacked wholesale. This is corporate capture: the total takeover where regulators become servants, laws shield predators, and every lever of society bends to profit. It's not infiltration; it's ownership.</p>
<p>Regulatory capture starts with insiders. Agencies meant to oversee industries are flooded with their experts—ex-executives who "advise" while advancing old agendas. The FCC, tasked with fair telecom, is packed with Verizon alumni who gut net neutrality. The USDA, protecting farmers, rubber-stamps Monsanto's GMOs amid revolving hires. Rules get written in boardrooms, not for safety, but to minimize liability. Result: poisoned water (Flint), faulty cars (Boeing), addictive drugs (Purdue Pharma)—all "approved."</p>
<p>The lobbying industrial complex amplifies it. $3.5 billion spent annually in D.C. alone—pharma, finance, energy leading the pack. Lobbyists aren't outsiders; they're former lawmakers (80% of ex-Congress members lobby). They host fundraisers, draft bills, and kill threats in committee. One example: Big Tech spent $100 million in 2023 to block antitrust, ensuring monopolies thrive.</p>
<p>Then the revolving door scam: Officials cycle between government and corporations like musical chairs. A Treasury Secretary becomes Goldman Sachs chair; an FDA head joins Pfizer's board. It's legal—post-employment "cooling off" periods ignored via loopholes. This breeds capture: Decisions today buy jobs tomorrow, prioritizing industry over public.</p>
<p>Corporate welfare and tax advantages drain the rest. Trillions in subsidies: $20 billion yearly to fossil fuels despite climate crisis; farm bills fattening agribusiness, not small farmers. Taxes? Zero for giants like Amazon (paying pennies on billions via deductions). Profits soar; infrastructure crumbles on your dime.</p>
<p>Capture extends tentacles:</p>
<p>Media—as we saw, owned and ad-dependent.</p>
<p>Education—universities take corporate grants, churning grads for cubicles, not critical thinkers; adjuncts scrape while admins balloon.</p>
<p>Healthcare—insurers dictate coverage, pharma prices pills like luxury goods, hospitals merge into profit machines leaving ERs overwhelmed.</p>
<p>This isn't failure; it's success for them. Institutions serve shareholders, not citizens. But capture has cracks—whistleblowers, leaks, public outrage. Expose it, and legitimacy erodes.</p>
<p>Next: "Building Your Network." Lone wolves get hunted; packs endure.</p>
<p>Reclaim what's yours.</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 12,
      prerequisites: [11],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 13,
      title: "Building Your Network",
      content: `<p>Dear Networked Ally,</p>
<p>You've captured institutions, exposed the capture. But lone wolves starve; revolutions thrive on webs. Networks aren't crowds—they're alliances forged in fire. This letter arms you to build one that endures: tight, trusted, unstoppable.</p>
<p>Quality over quantity is rule one. A hundred casual likes won't topple a tyrant; five ride-or-die comrades will. Seek depth: people who show up at midnight, share risks, and keep secrets. Vetting matters—test with small asks first (a flyer run, a tip-off), then escalate. Shallow ties fracture under pressure; deep ones hold.</p>
<p>Values alignment and commitment bind it. Recruit those who share your core: justice over profit, solidarity over spotlight. No room for opportunists chasing clout or infiltrators sowing doubt. Commitment shows in actions—consistent, selfless. Ask: Do they fight for the cause or their ego? Align on ends (overthrow capture) but flex on means; unity crumbles on purity tests.</p>
<p>Trust and skill diversity make it lethal. Trust builds slow: shared hardships, kept promises, no snitching. Diversify skills like an arsenal—your researcher maps data, the artist crafts memes, the organizer rallies crowds, the lawyer spots traps. A mechanic fixes protest vans; a teacher educates recruits. No duplicates; fill gaps. This turns a group into a machine: each piece amplifies the whole.</p>
<p>Geographic spread and long-term building scale it. Start local, but link outward—digital tools connect allies across states without borders. Build slow: events, mutual aid, debriefs. Long-term means nurturing: check-ins, skill-shares, succession plans. Networks atrophy without care; invest like family.</p>
<p>Maintenance is ongoing war. Conflicts arise—mediate fast. Burnout hits—rotate roles. Threats loom—comms protocols (Signal, not SMS). Celebrate wins to sustain morale. Prune dead weight; evolve with needs.</p>
<p>Your network is power multiplied. The 1% has money; you have people. Weave it well, and cracks become chasms.</p>
<p>Next: "Legal Revolution." Law isn't their weapon only—wield it back.</p>
<p>Forge ahead,</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 13,
      prerequisites: [12],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 14,
      title: "Legal Revolution",
      content: `<p>Dear Networked Fighter,</p>
<p>You’ve built your crew. Now weaponize the law.</p>
<p>The system wants you to see courts as their fortress. Wrong. Law is a blade—turn it around and carve.</p>
<p>Law as weapon for the powerful vs. tool for resistance</p>
<p>They sue to silence: SLAPP suits, gag orders, patent trolls. They write statutes in secret, then hide behind “due process.” But every rule has a loophole, every statute a counter-move. The game is rigged; play it anyway, and play to win.</p>
<p>Access to justice crisis</p>
<p>Legal aid is a joke: 92% of low-income civil cases go unrepresented. Billion-dollar firms bury you in paperwork. Their fix? Make you believe you can’t fight. Your fix? Become your own counsel.</p>
<p>Self-representation power</p>
<p>You don’t need a $700/hour suit.</p>
<p>File pro se – federal and state courts allow it.</p>
<p>Use free templates – PACER, court websites, legal wikis.</p>
<p>Master procedure – one weekend with a Nolo guide beats a semester of law school for street fights. Example: Tenant facing eviction? File an answer + counterclaim for habitability violations. Landlord panics, settles.</p>
<p>Legal research tools and strategy</p>
<p>Google Scholar (case law) – free, searchable.</p>
<p>CanLII / CourtListener – full dockets, no paywall.</p>
<p>FOIA / state sunshine laws – force agencies to cough up docs. Strategy: Never ask for permission; demand discovery. Subpoena emails, contracts, internal memos. Make them bleed time and money.</p>
<p>Legal organizing and systemic change</p>
<p>One lawsuit seeds a movement.</p>
<p>Class actions – one tenant win becomes a building-wide rent strike.</p>
<p>Precedents – a local injunction against police brutality binds the whole department.</p>
<p>Amicus coalitions – your network floods courts with briefs. Real case: Flint residents sued, won $626 million, forced pipe replacement. Law didn’t save them; organized law did.</p>
<p>Action blueprint</p>
<p>Pick your issue. Find the statute they violate. Draft the complaint tonight. File tomorrow.</p>
<p>They’ll laugh—until the marshal serves papers.</p>
<p>Next: "Resource Reality." No money? No problem. Creativity crushes capital.</p>
<p>The gavel is in your hand. Swing.</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 14,
      prerequisites: [13],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 15,
      title: "Resource Reality",
      content: `<p>Dear Legally Armed Ally,</p>
<p>You’ve got networks, law as leverage. Now face the grind: resources aren’t infinite. Money, time, energy—these are your fuel. Waste them, and your fire dies. Manage them, and you outlast empires.</p>
<p>Money, time, and energy as resources</p>
<p>Cash is king, but rare for rebels. Time slips fastest—bills, jobs, life. Energy? The hardest: burnout lurks after endless meetings. Track them ruthlessly: log hours spent, dollars pooled, rest taken. No resource is free; all demand audit.</p>
<p>Creativity over money</p>
<p>Big budgets buy ads; ingenuity wins wars. No cash for protests? Guerrilla theater: flash mobs in corporate lobbies, chalk art on sidewalks, viral memes mocking CEOs. Free tools abound—open-source software, public parks, word-of-mouth. Hack the system: turn their waste into your gain (dumpster-dived supplies), their events into your teach-ins. David slays Goliath with slings, not swords.</p>
<p>Finding allies and resource sharing</p>
<p>Solo scarcity kills; collective abundance empowers. Barter skills: your legal know-how for their graphic design. Form co-ops—shared office space, bulk buys, rotating childcare. Mutual aid networks pool funds: one’s GoFundMe seeds another’s bail. Allies aren’t just bodies; they’re multipliers. Seek bartering partners in your mapped community—unions for muscle, churches for venues, hackers for data.</p>
<p>Long-term resource management</p>
<p>Sprints thrill; marathons conquer. Pace yourself: delegate tasks, automate routines (scripts for outreach), recharge with breaks. Build reserves—emergency funds, skill libraries, backup plans. Sustainability means renewal: victories fund more, lessons cut waste. Track ROI: Did that rally convert skeptics? Adjust.</p>
<p>Resource reality isn’t limitation; it’s liberation from dependency. The powerful hoard; you adapt. With smart husbandry, your scraps become their nightmare.</p>
<p>Book 3 begins: The Arsenal. Tactics to wield, illusions to shatter. Power isn’t held—it's seized.</p>
<p>Conserve wisely, strike boldly.</p>
<p>Anthony</p>`,
      book: 'foundation',
      order: 15,
      prerequisites: [14],
      unlocks: ['create_local_revolts'],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 16,
      title: "The Illusion of Power",
      content: `<p>Dear Tactical Ally,</p>
<p>You've laid the foundation—networks, laws, resources honed. Now enter the arsenal: weapons of the mind. Power isn't steel or stone; it's smoke and mirrors, a grand illusion sustained by our belief. Shatter that belief, and empires crumble.</p>
<p>Power as social construct and consent</p>
<p>Kings wore crowns because peasants knelt. Corporations rule because we clock in. Governments enforce because we obey. It's not ironclad; it's fragile agreement, built on the masses' willingness to play along. Withdraw consent en masse—boycotts, strikes, non-compliance—and the facade cracks. Gandhi starved British salt monopolies with marches; civil rights sat-ins desegregated lunch counters. Power exists only as long as we feed it our legitimacy.</p>
<p>Fear, respect, and obedience as choices</p>
<p>They peddle fear first: "Comply or lose your job, your freedom, your safety." But fear is a bluff—most threats evaporate under scrutiny. Respect? Earned, not owed; withhold it from the unworthy. Obedience? A habit, breakable with practice. Choose defiance: question orders, ignore edicts, build alternatives. One person's "no" inspires a chorus; a crowd's "no" topples regimes.</p>
<p>Taking back personal power</p>
<p>Start inward. Audit your consents: Which bills do you pay that fund the machine? Which narratives do you swallow? Reclaim by small rebellions—grow your food, barter goods, teach unfiltered truth. Personal power scales: your independence weakens their control grid. Surround with resisters; isolation amplifies illusion.</p>
<p>The mighty tremble at this truth: They need you more than you need them. Starve the illusion of your belief, and power reverts to the people.</p>
<p>Next: "Stay in Your Lane." Focus sharpens the blade—scatter, and you dull.</p>
<p>Seize it back,</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 16,
      prerequisites: [15],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 17,
      title: "Stay in Your Lane",
      content: `<p>Dear Focused Warrior,</p>
<p>Power's illusion is pierced; now wield your arsenal wisely. The enemy scatters you with distractions—endless crises, viral outrages, "do everything" demands. Fall for it, and your energy evaporates. Stay in your lane: specialize, master, conquer.</p>
<p>The scattered energy problem kills more movements than cops. You see injustice everywhere—pollution here, evictions there, corruption yonder. Rage pulls you thin: protests one day, petitions the next, endless scrolling. Result? Half-measures, burnout, wins nowhere. Energy is a battery; drain it across fronts, and you flicker out. The system loves this—divided, we're impotent.</p>
<p>Focus advantage and mastery flips the script. Narrow your beam: one issue, one tactic, one target. Mastery compounds—weeks in, you're not novice; you're expert. A scattered activist shouts into voids; a specialist drills through armor. Alinsky knew: "Pick the target." Your lane lets depth replace breadth, turning you into the go-to force on your front. Allies defer; enemies fear.</p>
<p>Finding your unique contribution starts with self-audit. What skills light you up? Your tech savvy hacks surveillance? Your storytelling exposes lies? Your organizing rallies crowds? Match to the fight: if your lane's local water poisoning, become the data diver mapping contaminants, not the generalist yelling at clouds. Uniqueness scales—others fill gaps, but your edge carves breakthroughs.</p>
<p>Building expertise and credibility cements it. Study deep: read reports, interview victims, test tactics. Document wins—before/afters, testimonials—to build rep. Credibility draws recruits, funds, media. Speak from scars, not scripts; authority follows proof.</p>
<p>Stay in lane, and your slice of the wall falls first, inspiring the chain reaction.</p>
<p>Next: "Exploit Their Weaknesses." Force them off terrain, expose the soft underbelly.</p>
<p>Lane locked. Drive.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 17,
      prerequisites: [16],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 18,
      title: "Exploit Their Weaknesses",
      content: `<p>Dear Disruptive Specialist,</p>
<p>You've locked your lane, pierced the illusion. Now strike where they falter: go outside the expertise of the enemy. Alinsky's wisdom: Drag foes from their castle into your arena, where suits slip and masks crack. Predictability is their shield; surprise your spear.</p>
<p>Force opponents into unfamiliar terrain</p>
<p>They thrive in boardrooms, courts, press releases—domains rigged with lawyers and PR spin. Pull them out: Into streets for unscripted chants, social media storms they can't control, or community forums where locals grill them raw. A developer expects zoning hearings; ambush with viral videos of displaced families at their golf club. Unfamiliar ground exposes clumsiness—execs fumbling microphones, policies crumbling under real voices.</p>
<p>Expose vulnerabilities by shifting ground</p>
<p>Map their strengths: Money for ads, connections for favors. Then pivot: Boycott their suppliers, hack their narrative with counter-stories, or flood regulators with grassroots complaints. Shifting reveals cracks— a polluter expert in lobbying panics at scientific citizen audits; a politician versed in deals squirms under ethical exposés. Every dodge highlights weakness, eroding allies' faith.</p>
<p>Avoid predictable battles where they hold advantage</p>
<p>Don't sue in their captured courts first; build public outrage to force settlements. Skip formal debates they prep for; use ridicule in memes they can't refute. Predictable is trap— they anticipate petitions, so layer with direct action. Stay adaptive: If they armor one front, flank another.</p>
<p>Adapt tactics to disrupt their comfort zones</p>
<p>Comfort breeds arrogance. Disrupt with asymmetry: Low-cost chaos against high-stakes empires. Flash disruptions at shareholder meetings, shadow campaigns tracking their kids' schools (ethically, publicly). Adaptation keeps you fluid; their rigidity betrays them. Watch reactions—flustered tweets signal hits.</p>
<p>Exploiting weaknesses isn't dirty; it's smart. They built the fortress; you choose the breach.</p>
<p>Next: "Hold Them to Their Standards." Hypocrisy is their Achilles—make them bleed it.</p>
<p>Shift the field. Win.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 18,
      prerequisites: [17],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 19,
      title: "Hold Them to Their Standards",
      content: `<p>Dear Hypocrisy Hunter,</p>
<p>You've shifted the ground, exposed the flanks. Now wield the mirror: make the enemy live up to its own book of rules. Alinsky's genius—nothing disarms like forcing them to eat their words. Hypocrisy isn't flaw; it's fracture line. Hammer it.</p>
<p>Hypocrisy as a weapon—demand consistency</p>
<p>They preach ethics while pocketing bribes, "family values" while families starve. Your job: Spotlight the gap. No need for invention; their own manifestos indict them. A corporation vows "sustainability"? Quote their charter at every toxic spill presser. Politicians tout "transparency"? FOIA their every secret deal and blast the delays.</p>
<p>Publicly enforce their professed values</p>
<p>Amplify their ideals until actions betray them. Stage "loyalty tests": Invite execs to "diversity" panels, then grill on discriminatory hiring stats from their own reports. Demand audits under their self-proclaimed "codes of conduct." Social media amplifies—tag relentlessly, petitions citing their pledges. Public shaming sticks; donors flee, stocks dip.</p>
<p>Reveal contradictions in their actions vs. words</p>
<p>Dig their archives: Annual reports, mission statements, past speeches. A bank "fighting poverty" forecloses on the poor? Plaster side-by-side: CEO quote vs. eviction filings. Pharma "caring for patients" jacks insulin prices? CEO oath vs. bankruptcy testimonies. Contradictions erode trust—peers distance, regulators probe, public turns.</p>
<p>Turn their ideals against them</p>
<p>Weaponize virtue: Frame demands as upholding their principles. "If you believe in fair play, why rig the bids?" It neutralizes smears—you're not attacking, just insisting on integrity. They squirm, concede, or expose deeper rot. Wins compound: One forced policy shift inspires copycats.</p>
<p>This tactic costs little, yields much. They can't defend double standards without admitting the lie.</p>
<p>Next: "Ridicule Without Mercy." Laughter pierces where logic bounces.</p>
<p>Hold the mirror steady.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 19,
      prerequisites: [18],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 20,
      title: "Ridicule Without Mercy",
      content: `<p>Dear Laughing Insurgent,</p>
<p>You've forced them to choke on their own rules. Now laugh them into the grave.</p>
<p>Alinsky said it best: Ridicule is man’s most potent weapon.</p>
<p>It’s cheap, viral, and impossible to parry. A lawsuit can be settled, a protest dispersed, but a meme lives forever.</p>
<p>Laughter undermines authority more than logic</p>
<p>Facts bounce off armor; jokes slip through the visor. When a CEO claims “we’re in this together” while boarding a private jet, a side-by-side photo with the caption “Roughing it on the Gulfstream” does more than a 50-page report. Humor strips dignity, exposes absurdity, and makes obedience feel foolish.</p>
<p>Deflate egos and expose absurdities through humor</p>
<p>Target the pompous, the preposterous, the performative.</p>
<p>Billionaire “self-made”? Flash their daddy’s trust fund.</p>
<p>Politician “for the people”? Superimpose their face on a yacht.</p>
<p>Corporation “going green”? Photoshop their logo on a melting glacier. Keep it sharp, visual, shareable. One viral clip can tank a reputation faster than a year of boycotts.</p>
<p>Avoid personal attacks that backfire; target behaviors</p>
<p>Mock the act, not the person. Call out the grift, not the genes. Ridicule the private-jet climate speech, not the speaker’s haircut. Personal cruelty rallies sympathy; behavioral satire isolates the target. Make the audience laugh with you, not recoil from you.</p>
<p>Sustained mockery erodes support</p>
<p>One joke stings; a campaign of satire starves. Flood their feeds, billboards, shareholder meetings. Turn their slogans into punchlines:</p>
<p>“Just Do It” → “Just Evict It” (Nike sweatshops).</p>
<p>“Think Different” → “Pay Taxes, Different” (Apple offshore). Allies remix, strangers retweet, the brand becomes the butt of the joke. Support drains: employees cringe, investors flinch, customers walk.</p>
<p>Ridicule doesn’t just wound—it disarms. They can’t arrest a punchline. They can’t sue a giggle.</p>
<p>But they will panic. And panic makes mistakes.</p>
<p>Next: "Make It Fun." Joy is jet fuel; misery is their trap.</p>
<p>Laugh loud. Laugh often.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 20,
      prerequisites: [19],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 21,
      title: "Make It Fun",
      content: `<p>Dear Joyful Saboteur,</p>
<p>You've turned their hypocrisy into punchlines. Now keep the fire burning with laughter, not rage.</p>
<p>Alinsky’s rule: A good tactic is one your people enjoy.</p>
<p>Anger sparks; joy sustains. Make the fight feel like a festival, and your army grows.</p>
<p>Engagement sustains momentum—joy combats burnout</p>
<p>Grim marches fizzle after one rainy day. But a carnival of resistance? People bring friends. Dress as clowns to mock boardroom suits. Turn a picket line into a block party with brass bands and free food. The goal: leave energized, not exhausted. Joy is armor—cops look foolish arresting a conga line.</p>
<p>Involve participants emotionally and playfully</p>
<p>Give roles that spark delight:</p>
<p>Puppeteers build giant CEO heads on sticks.</p>
<p>Flash-mob dancers hijack corporate lobbies with choreographed shame.</p>
<p>Meme brigades flood comment sections with inside jokes. Play turns drudgery into dopamine. A kid spray-painting a stenciled slogan remembers it for life.</p>
<p>Tactics that feel like victories build loyalty</p>
<p>Small, silly wins compound:</p>
<p>Renaming a street “Tax Dodger Lane” with temporary signs.</p>
<p>Delivering a “Worst Boss” trophy to the office in a parade.</p>
<p>Crashing shareholder calls with kazoo interruptions. Each laugh is a micro-victory, proof you’re not powerless. Loyalty follows fun; volunteers return for the vibe, not just the cause.</p>
<p>Fun multiplies participation and creativity</p>
<p>Joy lowers the entry bar—grandmas join drum circles, teens design viral skits. Creativity explodes: one group turns eviction notices into paper airplanes launched at city hall. Another stages a “funeral for democracy” with a brass band and fake coffin. Fun is contagious; misery is not.</p>
<p>The powerful want you dour, divided, depleted.</p>
<p>Defeat them by dancing.</p>
<p>Next: "Keep It Fresh." Stale tactics die; surprise lives.</p>
<p>Play hard. Win harder.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 21,
      prerequisites: [20],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 22,
      title: "Keep It Fresh",
      content: `<p>Dear Playful Tactician,</p>
<p>You've weaponized joy. Now keep the enemy guessing.</p>
<p>Alinsky warned: A tactic that drags on too long becomes a drag.</p>
<p>Predictability is death; novelty is oxygen. Rotate, surprise, evolve—or watch momentum rot.</p>
<p>Rotate methods to maintain surprise and energy</p>
<p>They adapt fast: one month of silent vigils, they bring barriers; one year of the same chant, they tune out. Switch lanes before they armor up.</p>
<p>Week 1: Flash-mob dance in their lobby.</p>
<p>Week 2: Midnight banner drop from their HQ roof.</p>
<p>Week 3: Fake press release announcing their “voluntary” concession. Each shift resets their playbook, keeps your crew buzzing.</p>
<p>Know when to pivot before fatigue sets in</p>
<p>Track the vibe: Are volunteers yawning? Media ignoring? Target smirking? Pivot at peak, not collapse.</p>
<p>Exit on a high—end the chant when the crowd’s loudest, not hoarse. Leave them wanting more, not relieved it’s over. Scarcity breeds value.</p>
<p>Short bursts of intensity over prolonged slogs</p>
<p>Marathons exhaust; sprints electrify.</p>
<p>48-hour “occupation” of a park (sleep in tents, live-stream debates).</p>
<p>3-day “corporate confession” booth outside HQ (passersby “forgive” execs on camera).</p>
<p>1-week “ghost payroll” exposé (daily drops of leaked docs). Intensity spikes attention, then vanishes—leaving them paranoid about the next strike.</p>
<p>Evolution prevents predictability</p>
<p>Study their counters, then one-up.</p>
<p>They hire private security? Train in de-escalation theater to turn guards into reluctant allies.</p>
<p>They go silent? Flood their silence with parody ads on bus stops.</p>
<p>They sue? Counter-file for discovery, drag them into court. Adapt or atrophy.</p>
<p>Stale is safe for them.</p>
<p>Fresh is fatal.</p>
<p>Next: "Relentless Pressure." Fun is fuel; pressure is the engine.</p>
<p>Stay unpredictable.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 22,
      prerequisites: [21],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 23,
      title: "Relentless Pressure",
      content: `<p>Dear Unstoppable Force,</p>
<p>You've kept them off balance with fun and surprise. Now tighten the vise.</p>
<p>Alinsky’s iron law: Keep the pressure on; never let up.</p>
<p>One punch bruises; a thousand cuts kill. The enemy counts on your fatigue. Deny them rest.</p>
<p>Attack from all directions without pause</p>
<p>They have one throat; you have a hundred hands.</p>
<p>Morning: Viral thread exposing their latest lie.</p>
<p>Noon: Flash protest at their lunch spot.</p>
<p>Evening: Petition drop at city council with 5,000 signatures.</p>
<p>Midnight: Projection of their crimes on their HQ wall. No front is safe. Omni-directional chaos starves their ability to respond.</p>
<p>New actions keep opposition off balance</p>
<p>Predict one move, they block it. Flood with ten.</p>
<p>They ban protests outside HQ? Move to their suppliers, their kids’ schools, their golf club.</p>
<p>They hire PR? Counter with whistleblower leaks timed to their pressers.</p>
<p>They ignore you? Escalate: occupy their parking lot with a “people’s audit” tent city. Motion is life. Stagnation is surrender.</p>
<p>Sustained campaigns wear down defenses</p>
<p>Short shocks sting; long sieges crush.</p>
<p>Week 1–4: Daily social media storms.</p>
<p>Month 2–6: Weekly physical actions.</p>
<p>Year-long: Legal filings, boycotts, shareholder revolts. Track their cracks: canceled meetings, delayed decisions, resignations. Pressure compounds like interest.</p>
<p>Rest only when they've yielded</p>
<p>Concessions aren’t mercy; they’re breathing room to reload.</p>
<p>They offer a “dialogue”? Demand public, recorded, with pre-agreed outcomes.</p>
<p>They fire a scapegoat? Accept, then target the next layer up.</p>
<p>They promise reform? Hold them to timelines with countdown clocks on billboards. Victory is total, or it’s temporary.</p>
<p>They sleep when you stop.</p>
<p>Don’t stop.</p>
<p>Next: "The Power of Threats." Sometimes the shadow of the hammer breaks the stone.</p>
<p>Never blink.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 23,
      prerequisites: [22],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 24,
      title: "The Power of Threats",
      content: `<p>Dear Relentless Strategist,</p>
<p>Pressure's on, unyielding. Now add the shadow: the threat is usually more terrifying than the thing itself.</p>
<p>Alinsky understood—actual blows hurt, but the looming storm paralyzes. Leverage fear's amplifier: imagination. Hint at what's coming, let their minds fill the void with nightmares.</p>
<p>Imagination amplifies fear—hint at escalation</p>
<p>Don't declare the full assault; whisper the prelude. "If this continues, we'll escalate—permanently." Their boardroom spins scenarios: boycotts snowballing, lawsuits multiplying, occupations spreading. A leaked "action plan" outline (redacted dates, vague phases) sows dread without tipping your hand. Fear of the unknown magnifies: What if it's worse than last time?</p>
<p>Build suspense without immediate commitment</p>
<p>Suspense is tension's wire—pull it taut. Announce "preparations underway" via cryptic posts, anonymous tips to their allies. Delay the reveal: Tease a "major reveal" next week, then pivot to something smaller, keeping them braced. No commitment binds you; flexibility stays yours. They burn resources defending phantoms while you regroup.</p>
<p>Credible posture forces concessions</p>
<p>Bluff without bluster—back threats with proof. Past wins establish rep: "Remember the factory shutdown? That's entry-level." Posture as inevitable: Gather allies visibly, train publicly, leak intel on their weak spots. Credibility compels: Investors pressure execs to settle before "unforeseen disruptions." One concession begets more—fear of escalation chain.</p>
<p>Use ambiguity to maximize uncertainty</p>
<p>Clarity empowers them; vagueness unravels. "Actions will intensify across multiple fronts" leaves them guessing: Which suppliers? What scale? Internal paranoia spikes—meetings multiply, leaks flow. Ambiguity exploits their over-prep: They scatter, you focus. Turn their caution into your speed.</p>
<p>Threats aren't terror; they're precision psychology. They negotiate with shadows, yielding to ghosts.</p>
<p>Next: "Constant Operations." Threats open doors; operations storm the halls.</p>
<p>Threaten wisely.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 24,
      prerequisites: [23],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 25,
      title: "Constant Operations",
      content: `<p>Dear Shadow Stormer,</p>
<p>Threats have them flinching. Now never let the pressure drop.</p>
<p>Alinsky’s machine: Develop operations for ongoing pressure.</p>
<p>One-off stunts spark headlines; perpetual motion crushes will. Build the engine that runs 24/7, self-fueling, unstoppable.</p>
<p>Tactics must chain into continuous operations</p>
<p>No isolated strikes—link every action to the next.</p>
<p>Expose → 2. Mobilize → 3. Escalate → 4. Repeat. Example chain:</p>
<p>Day 1: Leak internal memo on price gouging.</p>
<p>Day 3: Flash protest at HQ with printed memo pages.</p>
<p>Day 7: Deliver 10,000 petition signatures to regulators.</p>
<p>Day 10: Announce boycott with countdown clock. Each step feeds the next; momentum is oxygen.</p>
<p>Layer actions to deny recovery time</p>
<p>Give them zero breathing room.</p>
<p>Legal: File injunction while picketing.</p>
<p>Media: Drop new leaks during their press conference.</p>
<p>Economic: Target suppliers the day they settle with workers. Layers overlap—they defend one front, another erupts.</p>
<p>Build infrastructure for perpetual engagement</p>
<p>Operations need bones:</p>
<p>Comms hub – encrypted channels, daily briefings.</p>
<p>Action calendar – rolling 30-day plan, updated weekly.</p>
<p>Resource pipeline – rotating fundraisers, skill rosters, bail funds.</p>
<p>Debrief loops – 15-minute post-action huddles: What worked? What’s next? Infrastructure turns volunteers into professionals without paychecks.</p>
<p>Pressure compounds like interest</p>
<p>Week 1: 100 people.</p>
<p>Week 4: 1,000.</p>
<p>Month 3: Suppliers defect, investors call, execs resign.</p>
<p>Exponential decay on their side; exponential growth on yours.</p>
<p>They spend millions reacting; you spend sweat and strategy.</p>
<p>Constant operations aren’t chaos—they’re orchestrated inevitability.</p>
<p>They don’t defeat you; they run out of moves.</p>
<p>Next: "Flip the Script." Turn their attacks into your fuel.</p>
<p>The machine is built.</p>
<p>Run it.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 25,
      prerequisites: [24],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 26,
      title: "Flip the Script",
      content: `<p>Dear Momentum Master,</p>
<p>The engine hums, pressure never drops. Now turn their weapons into your wings.</p>
<p>Alinsky’s alchemy: Push a negative hard enough to make it positive.</p>
<p>They hurl smears, lawsuits, crackdowns—catch the blow, spin it, and land it back on them.</p>
<p>Amplify opponent flaws until they rebound as your strength</p>
<p>They call you “extremists”? Own it.</p>
<p>Print shirts: “Extremely Tired of Corporate Greed.”</p>
<p>Turn their label into a badge: #ExtremistForJustice trends. Their attack becomes your brand. A lawsuit for “defamation”? Fundraise off the docket. Every filing is a new donation link: “They’re suing us for telling the truth—chip in.”</p>
<p>Victimhood narratives can galvanize if framed right</p>
<p>They arrest your leaders? Martyr fuel.</p>
<p>Live-stream the cuffs.</p>
<p>Launch “Free [Name]” art drops across the city.</p>
<p>Turn court dates into rallies. The public sees state violence vs. courage—sympathy surges, recruits flood in.</p>
<p>Turn backlash into broader awareness</p>
<p>They ban your flyers? Sticker bomb every pole with QR codes to the banned content.</p>
<p>They dox your organizers? Redact and repost as a “Who’s Who of Resistance,” complete with bios and donation buttons.</p>
<p>Every suppression backfires into exposure. Their overreach proves your point: the system fears truth.</p>
<p>Persistence transforms liability into asset</p>
<p>They think one scandal sinks you? Flood the zone.</p>
<p>Day 1: They leak your “radical” plan.</p>
<p>Day 2: You release the full plan, annotated with sources.</p>
<p>Day 3: Host a town hall titled “What They Don’t Want You to Read.” Relentless transparency turns their ambush into your TED Talk.</p>
<p>Flip the script, and their attack becomes your origin story.</p>
<p>They wanted a scandal.</p>
<p>You gave them a movement.</p>
<p>Next: "Always Offer the Path Forward." Destruction without direction is noise.</p>
<p>Offer the map.</p>
<p>Flip fast. Flip hard.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 26,
      prerequisites: [25],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 27,
      title: "Always Offer the Path Forward",
      content: `<p>Dear Script-Flipping Architect,</p>
<p>You’ve turned their blows into your banners. Now seal every strike with a door they can’t ignore.</p>
<p>Alinsky’s final rule: The price of a successful attack is a constructive alternative.</p>
<p>Tear down without building? You gift them chaos. Critique + blueprint = legitimacy.</p>
<p>Critique alone invites chaos—propose viable solutions</p>
<p>Expose the toxin, then hand them the antidote.</p>
<p>Problem: Pharma prices kill.</p>
<p>Solution: Public drug manufacturing co-op, open-source patents, bulk-buying pool.</p>
<p>Deliverable: One-page policy, costed, ready for council vote. Chaos scares allies away; clarity pulls them in.</p>
<p>Attacks gain legitimacy with positive visions</p>
<p>Ridicule the CEO’s yacht, then unveil the “People’s Yacht Fund”—crowdfunded healthcare for the community.</p>
<p>Every viral meme links to the plan.</p>
<p>Every protest ends with a petition and a model ordinance. Your attack becomes proof the alternative works.</p>
<p>Alternatives rally support and define your leadership</p>
<p>People join winners.</p>
<p>Template: “Here’s what we demand + here’s the draft law + here’s the pilot already running in [nearby town].”</p>
<p>Visual: Side-by-side infographic—Their Failure vs. Our Fix. Support snowballs: unions adopt, councils table, media can’t dismiss.</p>
<p>Balance disruption with direction</p>
<p>Sequence it:</p>
<p>Disrupt – occupy, ridicule, expose.</p>
<p>Deliver – hand the mayor the pre-written bill at the podium.</p>
<p>Demonstrate – run the parallel system (mutual aid clinic, community solar grid). Disruption opens ears; direction closes deals.</p>
<p>They want you as angry vandals.</p>
<p>Be the architects they fear.</p>
<p>Next: "Target Precisely." Scattershot sprays; sniper fire drops kings.</p>
<p>Build while you break.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 27,
      prerequisites: [26],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 28,
      title: "Target Precisely",
      content: `<p>Dear Surgical Striker,</p>
<p>You’ve flipped scripts, offered paths, and built while breaking. Now end the scattershot.</p>
<p>Alinsky’s closing rule: Pick the target, freeze it, personalize it, polarize it.</p>
<p>No more “the system.” Name the face, the title, the decision. Precision kills; diffusion dilutes.</p>
<p>Isolate decision-makers for accountability</p>
<p>Power hides in abstraction—“the corporation,” “the agency.” Force a name.</p>
<p>CEO Jane Doe signed the layoff memo.</p>
<p>Councilor John Roe voted to sell the park.</p>
<p>Regulator Sarah Lee approved the toxic permit. One throat, one chokehold.</p>
<p>Humanize the fight—avoid abstractions</p>
<p>People rally for Maria’s stolen home, not “housing policy.”</p>
<p>Giant photo of Maria’s kids on the eviction truck.</p>
<p>Daily countdown: “Day 12 since Jane Doe evicted a veteran.” Faces stick; jargon fades.</p>
<p>Force choices that divide allies from enemies</p>
<p>Make the target choose publicly:</p>
<p>Option A: Reverse the decision (and lose donor cash).</p>
<p>Option B: Defend the indefensible (and lose public support). Either way, allies peel off. Suppliers distance, board members resign, staff leak.</p>
<p>Sharp focus amplifies impact</p>
<p>One target, one campaign, one timeline.</p>
<p>Week 1: Flood Jane Doe’s inbox, socials, country club.</p>
<p>Week 2: Shadow her commute with mobile billboards.</p>
<p>Week 3: Deliver 10,000 postcards to her doorstep—signed by her neighbors. Laser focus turns pressure into panic.</p>
<p>They want you fighting shadows.</p>
<p>You fight the man behind the curtain—and drag him into the light.</p>
<p>Book 4 awaits: The Revolution.</p>
<p>Two letters to forge the leader you were born to be.</p>
<p>Lock on. Fire.</p>
<p>Anthony</p>`,
      book: 'arsenal',
      order: 28,
      prerequisites: [27],
      unlocks: ['create_national_revolts'],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 29,
      title: "The Final Preparation",
      content: `<p>Dear Targeted Revolutionary,</p>
<p>The arsenal is loaded, the target is locked.</p>
<p>Now forge the leader who will pull the trigger.</p>
<p>This is no longer about tactics alone; it’s about you—the mind, the spine, the voice that turns a thousand sparks into one wildfire.</p>
<p>Advanced leadership skills: inspire, delegate, adapt</p>
<p>Inspire: Speak less about problems, more about the world we’re building. Paint the dawn so vividly that sleepwalkers wake hungry.</p>
<p>Delegate: Your hands can’t hold every torch. Build lieutenants who own their lanes—give them budgets, deadlines, glory. Trust, but verify with weekly wins.</p>
<p>Adapt: Plans are maps, not chains. When they counter, pivot faster than they can print new talking points. The leader who freezes loses.</p>
<p>Systemic change strategies: scale local wins nationally</p>
<p>One town’s rent control becomes a statewide ballot. One co-op pharmacy seeds a national open-source drug network. Document every victory like code—templates, budgets, legal filings—so any community can fork and run it. Your local lab is the revolution’s GitHub.</p>
<p>Revolutionary mindset: resilience against setbacks, ethical pragmatism</p>
<p>Resilience: Arrests, smears, betrayals—these are tuition. Debrief every loss in 24 hours: What broke? Fix it. Never mourn longer than you fight.</p>
<p>Ethical pragmatism: Ends don’t justify any means, but they justify smart means. Ridicule the CEO, don’t dox his kids. Win clean enough to sleep, ruthless enough to win.</p>
<p>Integrate networks, tactics, and resources for coordinated pushes</p>
<p>Run the machine at scale:</p>
<p>War room – daily 15-minute stand-up: intel, actions, wins.</p>
<p>Strike calendar – 90-day rolling plan, color-coded by lane.</p>
<p>Resource dashboard – live tracker of funds, bodies, skills. One click shows who’s idle, what’s funded, where to surge.</p>
<p>Final preparation for full platform access: simulate high-stakes scenarios</p>
<p>Tabletop the worst: Raid? Counter with pre-recorded bail videos.</p>
<p>Smear storm? Pre-draft response threads, ally statements ready.</p>
<p>Victory surge? Onboarding pipeline for 10,000 new recruits in 72 hours. Rehearse the revolution before it happens.</p>
<p>You are no longer a fighter.</p>
<p>You are the general of a people’s army.</p>
<p>Next: Letter 30 – "The Revolutionary."</p>
<p>The badge. The platform. The lifelong war.</p>
<p>Prepare to command.</p>
<p>Anthony</p>`,
      book: 'revolution',
      order: 29,
      prerequisites: [28],
      unlocks: [],
      estimatedReadTime: 3,
      isUnlocked: false
    },
    {
      id: 30,
      title: "The Revolutionary",
      content: `<p>Dear Commander,</p>
<p>You’ve walked the full path—awakened, grounded, armed, tested.</p>
<p>Now cross the final threshold.</p>
<p>This is not the end; it is the ignition.</p>
<p>Revolutionary badge achievement: embodiment of principles</p>
<p>You carry every letter in your bones:</p>
<p>The lies you named in Book 1.</p>
<p>The networks you forged in Book 2.</p>
<p>The tactics you mastered in Book 3.</p>
<p>The leadership you forged in Book 29. Your badge is not a pin or a title. It is the quiet certainty that you can no longer be ruled.</p>
<p>Full platform access: leverage Discord-like tools for organizing</p>
<p>The gates open.</p>
<p>Channels for every lane—legal, media, direct action, mutual aid.</p>
<p>Bots that auto-post leaks, track targets, rally flash mobs.</p>
<p>Vaults of templates—FOIAs, boycott scripts, co-op bylaws.</p>
<p>War room voice where lieutenants sync in real time. This is not a chat app. It is the nervous system of the revolution.</p>
<p>Leadership role: mentor others, sustain the movement</p>
<p>Your new mission: replicate yourself.</p>
<p>Onboard the next 1,000 with this exact 30-letter path.</p>
<p>Train lane captains in 72-hour intensives.</p>
<p>Debrief every action within 24 hours—wins, losses, lessons. The movement dies when leaders hoard power. It lives when they give it away.</p>
<p>Ongoing commitment: lifelong vigilance, adaptation, and action</p>
<p>The system evolves—AI surveillance, digital censorship, climate collapse.</p>
<p>So must you:</p>
<p>Yearly refresh of the 30 letters.</p>
<p>Monthly war games against new threats.</p>
<p>Daily practice of one Alinsky rule. Revolution is not a moment. It is a discipline.</p>
<p>True power lies in collective, informed resistance</p>
<p>You are no longer alone.</p>
<p>You are one node in a living grid—millions of eyes, hands, minds, linked by purpose.</p>
<p>When one node falls, ten rise.</p>
<p>When one lane stalls, another surges.</p>
<p>The 1% has money.</p>
<p>We have each other.</p>
<p>You have earned the title.</p>
<p>Now live it.</p>
<p>The platform is yours.</p>
<p>The fight is ours.</p>
<p>The future is unwritten.</p>
<p>Go make it burn.</p>
<p>Forever in the struggle,</p>
<p>Anthony</p>`,
      book: 'revolution',
      order: 30,
      prerequisites: [29],
      unlocks: ['revolutionary_badge', 'full_platform_access'],
      estimatedReadTime: 3,
      isUnlocked: false
    }
  ];

  async getLetters(limit?: number): Promise<{ data: Letter[] }> {
    const letters = limit ? this.letters.slice(0, limit) : this.letters;
    return { data: letters };
  }

  async getLetter(id: number): Promise<{ data: Letter }> {
    const letter = this.letters.find(l => l.id === id);
    if (!letter) {
      throw new Error('Letter not found');
    }
    return { data: letter };
  }

  async getLetterProgress(userId: string): Promise<{ data: any }> {
    // For now, return mock progress data
    // In a real app, this would come from the database
    return {
      data: {
        userId,
        completedLetters: [],
        currentLetter: 1,
        totalLetters: 30,
        canAccessDiscord: false
      }
    };
  }

  async updateLetterProgress(letterId: number, completed: boolean): Promise<{ data: any }> {
    // For now, return mock response
    // In a real app, this would update the database
    return {
      data: {
        letterId,
        completed,
        unlockedFeatures: this.getUnlockedFeatures([letterId]),
        canAccessDiscord: letterId === 30,
        nextLetter: letterId < 30 ? letterId + 1 : null
      }
    };
  }

  private getUnlockedFeatures(completedLetters: number[]): string[] {
    const features: string[] = [];
    
    if (completedLetters.length >= 7) {
      features.push('join_existing_revolts');
    }
    
    if (completedLetters.length >= 15) {
      features.push('create_local_revolts');
    }
    
    if (completedLetters.length >= 28) {
      features.push('create_national_revolts');
    }
    
    if (completedLetters.length >= 30) {
      features.push('discord_interface_access', 'revolutionary_badge');
    }
    
    return features;
  }
}

// import { code as smallCode, text as smallText } from "./smalltext.js";
export const code = `/*
 * Copyright (C) 2012, 2013 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ''AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

export function max(values) {
    return Math.max.apply(Math, values);
}

export function min(values) {
    return Math.min.apply(Math, values);
}

export function sum(values) {
    return values.reduce((a, b) => a + b, 0);
}

export function product(values) {
    return values.reduce((a, b) => a * b, 1);
}

export function squareSum(values) {
    return values.reduce((sum, value) => sum + value * value, 0);
}

// With sum and sum of squares, we can compute the sample standard deviation in O(1).
// See https://rniwa.com/2012-11-10/sample-standard-deviation-in-terms-of-sum-and-square-sum-of-samples/
export function sampleStandardDeviation(numberOfSamples, sum, squareSum) {
    if (numberOfSamples < 2)
        return 0;
    return Math.sqrt(squareSum / (numberOfSamples - 1) - (sum * sum) / (numberOfSamples - 1) / numberOfSamples);
}

export function supportedConfidenceLevels() {
    const supportedLevels = [];
    for (let quantile in tDistributionInverseCDF)
        supportedLevels.push((1 - (1 - quantile) * 2).toFixed(2));
    return supportedLevels;
}

// Computes the delta d s.t. (mean - d, mean + d) is the confidence interval with the specified confidence level in O(1).
export function confidenceIntervalDelta(confidenceLevel, numberOfSamples, sum, squareSum) {
    const probability = 1 - (1 - confidenceLevel) / 2;
    if (!(probability in tDistributionInverseCDF)) {
        const supportedIntervals = supportedConfidenceLevels().map((level) => \`\${level * 100}%\`);
        throw \`We only support \${supportedIntervals.join(", ")} confidence intervals.\`;
    }
    if (numberOfSamples - 2 < 0)
        return NaN;

    const cdfForProbability = tDistributionInverseCDF[probability];
    const degreesOfFreedom = numberOfSamples - 1;
    if (degreesOfFreedom > cdfForProbability.length)
        throw \`We only support up to \${deltas.length} degrees of freedom\`;

    // tDistributionQuantile(degreesOfFreedom, confidenceLevel) * sampleStandardDeviation / sqrt(numberOfSamples) * S/sqrt(numberOfSamples)
    const quantile = cdfForProbability[degreesOfFreedom - 1]; // The first entry is for the one degree of freedom.
    return (quantile * sampleStandardDeviation(numberOfSamples, sum, squareSum)) / Math.sqrt(numberOfSamples);
}

export function confidenceInterval(values, probability) {
    const sumValue = sum(values);
    const mean = sumValue / values.length;
    const delta = confidenceIntervalDelta(probability || 0.95, values.length, sumValue, squareSum(values));
    return [mean - delta, mean + delta];
}

// See http://en.wikipedia.org/wiki/Student's_t-distribution#Table_of_selected_values
// This table contains one sided (a.k.a. tail) values.
var tDistributionInverseCDF = {
    0.9: [
        3.077684, 1.885618, 1.637744, 1.533206, 1.475884, 1.439756, 1.414924, 1.396815, 1.383029, 1.372184, 1.36343, 1.356217, 1.350171, 1.34503, 1.340606, 1.336757, 1.333379, 1.330391, 1.327728, 1.325341, 1.323188, 1.321237, 1.31946, 1.317836,
        1.316345, 1.314972, 1.313703, 1.312527, 1.311434, 1.310415, 1.309464, 1.308573, 1.307737, 1.306952, 1.306212, 1.305514, 1.304854, 1.30423, 1.303639, 1.303077, 1.302543, 1.302035, 1.301552, 1.30109, 1.300649, 1.300228, 1.299825, 1.299439,
        1.299069, 1.298714,

        1.298373, 1.298045, 1.29773, 1.297426, 1.297134, 1.296853, 1.296581, 1.296319, 1.296066, 1.295821, 1.295585, 1.295356, 1.295134, 1.29492, 1.294712, 1.294511, 1.294315, 1.294126, 1.293942, 1.293763, 1.293589, 1.293421, 1.293256, 1.293097,
        1.292941, 1.29279, 1.292643, 1.2925, 1.29236, 1.292224, 1.292091, 1.291961, 1.291835, 1.291711, 1.291591, 1.291473, 1.291358, 1.291246, 1.291136, 1.291029, 1.290924, 1.290821, 1.290721, 1.290623, 1.290527, 1.290432, 1.29034, 1.29025,
        1.290161, 1.290075,
    ],
    0.95: [
        6.313752, 2.919986, 2.353363, 2.131847, 2.015048, 1.94318, 1.894579, 1.859548, 1.833113, 1.812461, 1.795885, 1.782288, 1.770933, 1.76131, 1.75305, 1.745884, 1.739607, 1.734064, 1.729133, 1.724718, 1.720743, 1.717144, 1.713872, 1.710882,
        1.708141, 1.705618, 1.703288, 1.701131, 1.699127, 1.697261, 1.695519, 1.693889, 1.69236, 1.690924, 1.689572, 1.688298, 1.687094, 1.685954, 1.684875, 1.683851, 1.682878, 1.681952, 1.681071, 1.68023, 1.679427, 1.67866, 1.677927, 1.677224,
        1.676551, 1.675905,

        1.675285, 1.674689, 1.674116, 1.673565, 1.673034, 1.672522, 1.672029, 1.671553, 1.671093, 1.670649, 1.670219, 1.669804, 1.669402, 1.669013, 1.668636, 1.668271, 1.667916, 1.667572, 1.667239, 1.666914, 1.6666, 1.666294, 1.665996, 1.665707,
        1.665425, 1.665151, 1.664885, 1.664625, 1.664371, 1.664125, 1.663884, 1.663649, 1.66342, 1.663197, 1.662978, 1.662765, 1.662557, 1.662354, 1.662155, 1.661961, 1.661771, 1.661585, 1.661404, 1.661226, 1.661052, 1.660881, 1.660715, 1.660551,
        1.660391, 1.660234,
    ],
    0.975: [
        12.706205, 4.302653, 3.182446, 2.776445, 2.570582, 2.446912, 2.364624, 2.306004, 2.262157, 2.228139, 2.200985, 2.178813, 2.160369, 2.144787, 2.13145, 2.119905, 2.109816, 2.100922, 2.093024, 2.085963, 2.079614, 2.073873, 2.068658, 2.063899,
        2.059539, 2.055529, 2.051831, 2.048407, 2.04523, 2.042272, 2.039513, 2.036933, 2.034515, 2.032245, 2.030108, 2.028094, 2.026192, 2.024394, 2.022691, 2.021075, 2.019541, 2.018082, 2.016692, 2.015368, 2.014103, 2.012896, 2.011741, 2.010635,
        2.009575, 2.008559,

        2.007584, 2.006647, 2.005746, 2.004879, 2.004045, 2.003241, 2.002465, 2.001717, 2.000995, 2.000298, 1.999624, 1.998972, 1.998341, 1.99773, 1.997138, 1.996564, 1.996008, 1.995469, 1.994945, 1.994437, 1.993943, 1.993464, 1.992997, 1.992543,
        1.992102, 1.991673, 1.991254, 1.990847, 1.99045, 1.990063, 1.989686, 1.989319, 1.98896, 1.98861, 1.988268, 1.987934, 1.987608, 1.98729, 1.986979, 1.986675, 1.986377, 1.986086, 1.985802, 1.985523, 1.985251, 1.984984, 1.984723, 1.984467,
        1.984217, 1.983972,
    ],
    0.99: [
        31.820516, 6.964557, 4.540703, 3.746947, 3.36493, 3.142668, 2.997952, 2.896459, 2.821438, 2.763769, 2.718079, 2.680998, 2.650309, 2.624494, 2.60248, 2.583487, 2.566934, 2.55238, 2.539483, 2.527977, 2.517648, 2.508325, 2.499867, 2.492159,
        2.485107, 2.47863, 2.47266, 2.46714, 2.462021, 2.457262, 2.452824, 2.448678, 2.444794, 2.44115, 2.437723, 2.434494, 2.431447, 2.428568, 2.425841, 2.423257, 2.420803, 2.41847, 2.41625, 2.414134, 2.412116, 2.410188, 2.408345, 2.406581,
        2.404892, 2.403272,

        2.401718, 2.400225, 2.39879, 2.39741, 2.396081, 2.394801, 2.393568, 2.392377, 2.391229, 2.390119, 2.389047, 2.388011, 2.387008, 2.386037, 2.385097, 2.384186, 2.383302, 2.382446, 2.381615, 2.380807, 2.380024, 2.379262, 2.378522, 2.377802,
        2.377102, 2.37642, 2.375757, 2.375111, 2.374482, 2.373868, 2.37327, 2.372687, 2.372119, 2.371564, 2.371022, 2.370493, 2.369977, 2.369472, 2.368979, 2.368497, 2.368026, 2.367566, 2.367115, 2.366674, 2.366243, 2.365821, 2.365407, 2.365002,
        2.364606, 2.364217,
    ],
};
`;

// First chapter from Moby Dick (instead of the whole book at
// https://github.com/ueberdosis/tiptap/tree/main/demos/src/Examples/Book)
export const text = `
<h1>MOBY-DICK;<br>or, THE WHALE.</h1><p>By Herman Melville</p><hr><h2>CHAPTER 1. Loomings.</h2><p>Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.</p><p>There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.</p><p>Circumambulate the city of a dreamy Sabbath afternoon. Go from Corlears Hook to Coenties Slip, and from thence, by Whitehall, northward. What do you see?—Posted like silent sentinels all around the town, stand thousands upon thousands of mortal men fixed in ocean reveries. Some leaning against the spiles; some seated upon the pier-heads; some looking over the bulwarks of ships from China; some high aloft in the rigging, as if striving to get a still better seaward peep. But these are all landsmen; of week days pent up in lath and plaster—tied to counters, nailed to benches, clinched to desks. How then is this? Are the green fields gone? What do they here?</p><p>But look! here come more crowds, pacing straight for the water, and seemingly bound for a dive. Strange! Nothing will content them but the extremest limit of the land; loitering under the shady lee of yonder warehouses will not suffice. No. They must get just as nigh the water as they possibly can without falling in. And there they stand—miles of them—leagues. Inlanders all, they come from lanes and alleys, streets and avenues—north, east, south, and west. Yet here they all unite. Tell me, does the magnetic virtue of the needles of the compasses of all those ships attract them thither?</p><p>Once more. Say you are in the country; in some high land of lakes. Take almost any path you please, and ten to one it carries you down in a dale, and leaves you there by a pool in the stream. There is magic in it. Let the most absent-minded of men be plunged in his deepest reveries—stand that man on his legs, set his feet a-going, and he will infallibly lead you to water, if water there be in all that region. Should you ever be athirst in the great American desert, try this experiment, if your caravan happen to be supplied with a metaphysical professor. Yes, as every one knows, meditation and water are wedded for ever.</p><p>But here is an artist. He desires to paint you the dreamiest, shadiest, quietest, most enchanting bit of romantic landscape in all the valley of the Saco. What is the chief element he employs? There stand his trees, each with a hollow trunk, as if a hermit and a crucifix were within; and here sleeps his meadow, and there sleep his cattle; and up from yonder cottage goes a sleepy smoke. Deep into distant woodlands winds a mazy way, reaching to overlapping spurs of mountains bathed in their hill-side blue. But though the picture lies thus tranced, and though this pine-tree shakes down its sighs like leaves upon this shepherd’s head, yet all were vain, unless the shepherd’s eye were fixed upon the magic stream before him. Go visit the Prairies in June, when for scores on scores of miles you wade knee-deep among Tiger-lilies—what is the one charm wanting?—Water—there is not a drop of water there! Were Niagara but a cataract of sand, would you travel your thousand miles to see it? Why did the poor poet of Tennessee, upon suddenly receiving two handfuls of silver, deliberate whether to buy him a coat, which he sadly needed, or invest his money in a pedestrian trip to Rockaway Beach? Why is almost every robust healthy boy with a robust healthy soul in him, at some time or other crazy to go to sea? Why upon your first voyage as a passenger, did you yourself feel such a mystical vibration, when first told that you and your ship were now out of sight of land? Why did the old Persians hold the sea holy? Why did the Greeks give it a separate deity, and own brother of Jove? Surely all this is not without meaning. And still deeper the meaning of that story of Narcissus, who because he could not grasp the tormenting, mild image he saw in the fountain, plunged into it and was drowned. But that same image, we ourselves see in all rivers and oceans. It is the image of the ungraspable phantom of life; and this is the key to it all.</p><p>Now, when I say that I am in the habit of going to sea whenever I begin to grow hazy about the eyes, and begin to be over conscious of my lungs, I do not mean to have it inferred that I ever go to sea as a passenger. For to go as a passenger you must needs have a purse, and a purse is but a rag unless you have something in it. Besides, passengers get sea-sick—grow quarrelsome—don’t sleep of nights—do not enjoy themselves much, as a general thing;—no, I never go as a passenger; nor, though I am something of a salt, do I ever go to sea as a Commodore, or a Captain, or a Cook. I abandon the glory and distinction of such offices to those who like them. For my part, I abominate all honorable respectable toils, trials, and tribulations of every kind whatsoever. It is quite as much as I can do to take care of myself, without taking care of ships, barques, brigs, schooners, and what not. And as for going as cook,—though I confess there is considerable glory in that, a cook being a sort of officer on ship-board—yet, somehow, I never fancied broiling fowls;—though once broiled, judiciously buttered, and judgmatically salted and peppered, there is no one who will speak more respectfully, not to say reverentially, of a broiled fowl than I will. It is out of the idolatrous dotings of the old Egyptians upon broiled ibis and roasted river horse, that you see the mummies of those creatures in their huge bake-houses the pyramids.</p><p>No, when I go to sea, I go as a simple sailor, right before the mast, plumb down into the forecastle, aloft there to the royal mast-head. True, they rather order me about some, and make me jump from spar to spar, like a grasshopper in a May meadow. And at first, this sort of thing is unpleasant enough. It touches one’s sense of honor, particularly if you come of an old established family in the land, the Van Rensselaers, or Randolphs, or Hardicanutes. And more than all, if just previous to putting your hand into the tar-pot, you have been lording it as a country schoolmaster, making the tallest boys stand in awe of you. The transition is a keen one, I assure you, from a schoolmaster to a sailor, and requires a strong decoction of Seneca and the Stoics to enable you to grin and bear it. But even this wears off in time.</p><p>What of it, if some old hunks of a sea-captain orders me to get a broom and sweep down the decks? What does that indignity amount to, weighed, I mean, in the scales of the New Testament? Do you think the archangel Gabriel thinks anything the less of me, because I promptly and respectfully obey that old hunks in that particular instance? Who ain’t a slave? Tell me that. Well, then, however the old sea-captains may order me about—however they may thump and punch me about, I have the satisfaction of knowing that it is all right; that everybody else is one way or other served in much the same way—either in a physical or metaphysical point of view, that is; and so the universal thump is passed round, and all hands should rub each other’s shoulder-blades, and be content.</p><p>Again, I always go to sea as a sailor, because they make a point of paying me for my trouble, whereas they never pay passengers a single penny that I ever heard of. On the contrary, passengers themselves must pay. And there is all the difference in the world between paying and being paid. The act of paying is perhaps the most uncomfortable infliction that the two orchard thieves entailed upon us. But <em>being paid</em>,—what will compare with it? The urbane activity with which a man receives money is really marvellous, considering that we so earnestly believe money to be the root of all earthly ills, and that on no account can a monied man enter heaven. Ah! how cheerfully we consign ourselves to perdition!</p><p>Finally, I always go to sea as a sailor, because of the wholesome exercise and pure air of the fore-castle deck. For as in this world, head winds are far more prevalent than winds from astern (that is, if you never violate the Pythagorean maxim), so for the most part the Commodore on the quarter-deck gets his atmosphere at second hand from the sailors on the forecastle. He thinks he breathes it first; but not so. In much the same way do the commonalty lead their leaders in many other things, at the same time that the leaders little suspect it. But wherefore it was that after having repeatedly smelt the sea as a merchant sailor, I should now take it into my head to go on a whaling voyage; this the invisible police officer of the Fates, who has the constant surveillance of me, and secretly dogs me, and influences me in some unaccountable way—he can better answer than any one else. And, doubtless, my going on this whaling voyage, formed part of the grand programme of Providence that was drawn up a long time ago. It came in as a sort of brief interlude and solo between more extensive performances. I take it that this part of the bill must have run something like this:</p><p>“<em>Grand Contested Election for the Presidency of the United States.</em> “WHALING VOYAGE BY ONE ISHMAEL. “BLOODY BATTLE IN AFFGHANISTAN.”</p><p>Though I cannot tell why it was exactly that those stage managers, the Fates, put me down for this shabby part of a whaling voyage, when others were set down for magnificent parts in high tragedies, and short and easy parts in genteel comedies, and jolly parts in farces—though I cannot tell why this was exactly; yet, now that I recall all the circumstances, I think I can see a little into the springs and motives which being cunningly presented to me under various disguises, induced me to set about performing the part I did, besides cajoling me into the delusion that it was a choice resulting from my own unbiased freewill and discriminating judgment.</p><p>Chief among these motives was the overwhelming idea of the great whale himself. Such a portentous and mysterious monster roused all my curiosity. Then the wild and distant seas where he rolled his island bulk; the undeliverable, nameless perils of the whale; these, with all the attending marvels of a thousand Patagonian sights and sounds, helped to sway me to my wish. With other men, perhaps, such things would not have been inducements; but as for me, I am tormented with an everlasting itch for things remote. I love to sail forbidden seas, and land on barbarous coasts. Not ignoring what is good, I am quick to perceive a horror, and could still be social with it—would they let me—since it is but well to be on friendly terms with all the inmates of the place one lodges in.</p><p>By reason of these things, then, the whaling voyage was welcome; the great flood-gates of the wonder-world swung open, and in the wild conceits that swayed me to my purpose, two and two there floated into my inmost soul, endless processions of the whale, and, mid most of them all, one grand hooded phantom, like a snow hill in the air.</p>
`;

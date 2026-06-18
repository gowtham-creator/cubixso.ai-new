// Home — canonical single-page scroll. 11 chapters, one narrative.
// The /services, /products, /industries, /about, /contact routes mirror
// individual sections for SEO/deep-linking but the home page IS the spine.

import { Hero }        from "@/components/sections/Hero";
import { Manifesto }   from "@/components/sections/Manifesto";
import { InfoBand }    from "@/components/sections/InfoBand";
import { KineticStack } from "@/components/sections/KineticStack";
import { Services }    from "@/components/sections/Services";
import { Work }        from "@/components/sections/Work";
import { Industries }  from "@/components/sections/Industries";
import { WhyUs }       from "@/components/sections/WhyUs";
import { CubeScroller } from "@/components/sections/CubeScroller";
import { Metrics }     from "@/components/sections/Metrics";
import { Testimonial } from "@/components/sections/Testimonial";
import { BackedBy }    from "@/components/sections/BackedBy";
import { Global }      from "@/components/sections/Global";
import { FinalCTA }    from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <main>
      <Hero />          {/* 01 · FUTURE                  */}
      <Manifesto />     {/* 02 · INTELLIGENCE            */}
      <BackedBy />      {/* TRUSTED INFRASTRUCTURE — partner logos, surfaced
                            early (just under the hero/intro) per request      */}
      <InfoBand />      {/* 02b · WHO WE ARE (facts)     */}
      <KineticStack />  {/* 03 · THE IDEA                */}
      <Services />      {/* 04 · CAPABILITIES            */}
      <Work />          {/* 05 · PRODUCTS                */}
      <Industries />    {/* 06 · INDUSTRIES              */}
      <WhyUs />         {/* 07 · EDGE                    */}
      <CubeScroller />  {/* 07b · DIMENSIONAL (scrub)    */}
      <Metrics />       {/* 08 · PROOF                   */}
      <Testimonial />   {/*       (bridge — bold quote)  */}
      <Global />        {/* 10 · REACH                   */}
      <FinalCTA />      {/* 11 · LEGACY                  */}
    </main>
  );
}

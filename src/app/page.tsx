// Home — canonical single-page scroll. 11 chapters, one narrative.
// The /services, /products, /industries, /about, /contact routes mirror
// individual sections for SEO/deep-linking but the home page IS the spine.

import { Hero }        from "@/components/sections/Hero";
import { Manifesto }   from "@/components/sections/Manifesto";
import { KineticStack } from "@/components/sections/KineticStack";
import { Services }    from "@/components/sections/Services";
import { Work }        from "@/components/sections/Work";
import { Industries }  from "@/components/sections/Industries";
import { WhyUs }       from "@/components/sections/WhyUs";
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
      <KineticStack />  {/* 03 · KINETIC                 */}
      <Services />      {/* 04 · CAPABILITIES            */}
      <Work />          {/* 05 · PRODUCTS                */}
      <Industries />    {/* 06 · INDUSTRIES              */}
      <WhyUs />         {/* 07 · EDGE                    */}
      <Metrics />       {/* 08 · PROOF                   */}
      <Testimonial />   {/*       (bridge — bold quote)  */}
      <BackedBy />      {/* 09 · TRUSTED INFRASTRUCTURE  */}
      <Global />        {/* 10 · REACH                   */}
      <FinalCTA />      {/* 11 · LEGACY                  */}
    </main>
  );
}

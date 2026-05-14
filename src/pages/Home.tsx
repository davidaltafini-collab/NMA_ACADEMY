import React from "react";
import Hero from "./HomeSections/Hero";
import About from "./HomeSections/About";
import Courses from "./HomeSections/Courses";
import TargetAudience from "./HomeSections/TargetAudience";
import Deliverables from "./HomeSections/Deliverables";
import Benefits from "./HomeSections/Benefits";
import Testimonials from "./HomeSections/Testimonials";
import FAQ from "./HomeSections/FAQ";
import FinalCTA from "./HomeSections/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <About />
      <Courses />
      <TargetAudience />
      <Deliverables />
      <Benefits />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </div>
  );
}

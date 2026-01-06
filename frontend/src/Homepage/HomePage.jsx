import { useState } from 'react'
import Hero from './hero'
//import Background3D from './Background3d'
import Features from './Features'
import Footer from './Footer'
import { Background3D, Wave } from './Background3d'
import CreatorsSection from './CreatorsSection'
import RateCalculator from './RateCalculator'


function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Background3D />
      <Wave />
      <div className='relative z-10 '>
        <Hero />
        <CreatorsSection />
        <RateCalculator />
        <Features />
        <Footer />
      </div>







    </>
  )
}

export default HomePage






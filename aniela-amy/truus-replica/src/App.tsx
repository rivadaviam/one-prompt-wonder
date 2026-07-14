import Navigation from './components/Navigation'
import Hero from './components/Hero'
import WorkSection from './components/WorkSection'
import TeamSection from './components/TeamSection'
import ServicesSection from './components/ServicesSection'
import ClientsSection from './components/ClientsSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <WorkSection />
        <TeamSection />
        <ServicesSection />
        <ClientsSection />
      </main>
      <Footer />
    </>
  )
}

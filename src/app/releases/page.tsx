import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '跨我身體 OVER MY BODY - Releases',
  description: 'Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.',
};

/**
 * Releases page component - displays the catalog of music releases
 * Content migrated from original release.html partial
 */
export default function ReleasesPage() {
  return (
    <>
      <h1>RELEASE</h1>
      <p className="lead">Discover our catalog of avant-garde sounds and experimental compositions from emerging and established artists.</p>

      <div className="release-grid">
        <a href="https://overmybody.bandcamp.com/album/beni" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0615475154_2.jpg" alt="Beni" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Beni</h3>
            <p>WRACK</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/petals-of-nehan" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0510770362_2.jpg" alt="Petals of Nehan" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Petals of Nehan</h3>
            <p>W.ANNA.W</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/oneiric" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a3723654467_2.jpg" alt="ONEIRIC" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>ONEIRIC</h3>
            <p>Max Dahlhaus</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/xorath" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0534762536_2.jpg" alt="Xorath" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Xorath</h3>
            <p>Digitonica, Lujiachi</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/vessels-of-chaos-mercurial-blood" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a3042582942_2.jpg" alt="Vessels of Chaos : Mercurial Blood" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Vessels of Chaos : Mercurial Blood</h3>
            <p>Griigg</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/godspeed" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0404063958_2.jpg" alt="GODSPEED" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>GODSPEED</h3>
            <p>SMT3X</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/paths-and-patches" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a2347719555_2.jpg" alt="Paths and Patches" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Paths and Patches</h3>
            <p>Rumina</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/nox-flamma" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a2815280981_2.jpg" alt="Nox-flamma" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Nox-flamma</h3>
            <p>Tufi, DIGITONICA</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/transmute" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0889152889_2.jpg" alt="Transmute" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Transmute</h3>
            <p>Burnt Offerings</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/fiori-notturni" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0666744917_2.jpg" alt="Fiori Notturni" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Fiori Notturni</h3>
            <p>Capiuz</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/apex-union-split-01-x-club-late-music" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a2752375797_2.jpg" alt="Apex Union [SPLIT-01 x Club Late Music]" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Apex Union [SPLIT-01 x Club Late Music]</h3>
            <p>Lujiachi, Bungalovv</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/ninsei-lane" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a2604856864_2.jpg" alt="Ninsei Lane" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Ninsei Lane</h3>
            <p>Max Dahlhaus</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/moon-beam" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a3116351302_2.jpg" alt="Moon Beam" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Moon Beam</h3>
            <p>B E N N x WRACK</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/dumpling-machine-xp" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a1040485148_2.jpg" alt="Dumpling Machine. XP" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Dumpling Machine. XP</h3>
            <p>Sabiwa</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/saam" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a1298637559_2.jpg" alt="SAAM" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>SAAM</h3>
            <p>Capiuz, Leese</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/hotto-kotto" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a1821086039_2.jpg" alt="Hotto Kotto" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Hotto Kotto</h3>
            <p>WRACK</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/mantis" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a2255575529_2.jpg" alt="Mantis" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Mantis</h3>
            <p>Lujiachi</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/pulverized" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0126209546_2.jpg" alt="Pulverized" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Pulverized</h3>
            <p>Capiuz</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/how-to-respond-to-turmoil" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a0529542495_2.jpg" alt="How To Respond To Turmoil" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>How To Respond To Turmoil</h3>
            <p>personalbrand</p>
          </div>
        </a>

        <a href="https://overmybody.bandcamp.com/album/koma-vol-1" target="_blank" className="release-item">
          <div className="release-art">
            <Image src="https://f4.bcbits.com/img/a4069287329_2.jpg" alt="Koma vol.1" width={300} height={300} />
          </div>
          <div className="release-info">
            <h3>Koma vol.1</h3>
            <p>Various Artists</p>
          </div>
        </a>
      </div>
    </>
  );
}

// Import the HtmlStringsAffixer module from hsa-js
import("hsa-js").then(HtmlStringsAffixer => {
    // Import the fs (file system) and path modules from Node.js
    const fs = require('fs');
    const path = require('path');

    // Define the path to the directory you want to analyze
    const folderPath = process.argv[2] ?? 'resources/views/admin/action_campaign';

    // Define a function to analyze a directory
    function analyzeDirectory(directory) {
        // Read the directory
        fs.readdir(directory, (err, items) => {
            // If there's an error reading the directory, log it and return
            if (err) {
                console.error(`Error reading directory: ${err}`);
                return;
            }

            // For each item in the directory...
            items.forEach(item => {
                // Get the full path to the item
                const itemPath = path.join(directory, item);

                // Get the stats of the item (file or directory)
                fs.stat(itemPath, (err, stats) => {
                    // If there's an error getting the stats, log it and return
                    if (err) {
                        console.error(`Error getting file stats: ${err}`);
                        return;
                    }

                    // If the item is a directory...
                    if (stats.isDirectory()) {
                        // ...analyze the directory recursively
                        analyzeDirectory(itemPath);
                    } 
                    // If the item is a file...
                    else if (stats.isFile()) {
                        // ...read the file
                        fs.readFile(itemPath, 'utf8', (err, bladeTemplateContent) => {
                            // If there's an error reading the file, log it and return
                            if (err) {
                                console.error(`Error reading file ${itemPath}: ${err}`);
                                return;
                            }

                            // Create a new HtmlStringsAffixer with the desired configuration
                            const affixer = new HtmlStringsAffixer.default({
                                ignore: ["#", "_", ">", "^", "*", "=", "%", "@", "$", "'"],
                                warnings: ["{", "}",],
                                // warnings: ["{", "(", "}", ")"],
                                extractions: [
                                    "text",
                                    "placeholder", 
                                    "alt", 
                                    "title", 
                                ],
                            });

                            let edited = false;

                            // Analyze the content of the file
                            const result = affixer.analyze(bladeTemplateContent, true);

                            // Log the results
                            console.log(`Analyzing File: ${itemPath}`);

                            listOption = process.argv[3] === '--list';
                            
                            // Translatable strings
                            if (result.translatableStrings.length > 0) {
                                result.translatableStrings.forEach((string, index) => {
                                    if (listOption) {
                                        console.log(`"key" =>  "${string.found.trim()}"`);
                                    } 
                                    
                                    if (!listOption)  {
                                        console.log('');
                                        console.log(`String: "${string.found}"`);
                                        string.lines.forEach(line => {
                                            console.log(`${itemPath}:${line}`);
                                        })
                                    }

                                    // Update if translation already exists
                                    let found = string.found.trim();
                                    let key = getTranslatedStrngs(found);
                                    if (key) {
                                        edited = true;
                                        bladeTemplateContent = bladeTemplateContent.replace(new RegExp(found, 'g'), "{{ 'canon." + key + "' | trans }}");
                                    }
                                });
                                console.log('---Translatables End---');
                            } else {
                                console.log('');
                                console.log('No translatable strings found.');
                            }
                            console.log('');
                            result.warningStrings.forEach((string, index) => {
                                if (listOption) {
                                    console.log(`"key" => "${string.found.trim()}"`);
                                }

                                if (!listOption) {
                                    console.log('---ATTENTION!---');
                                    console.log(` - "${string.found.trim()}"`);
                                    console.error(`Warning chars found: "${string.warningChars.join(';')};"`);
                                    string.lines.forEach(line => {
                                        console.log(`${itemPath}:${line}`);
                                    })
                                }
                            });
                            
                            if (result.warningStrings.length === 0) {
                                console.log('No warning chars found.');
                            } else {
                                console.log('---Warnings End---');
                            
                            }
                            console.log('');
                            console.log('---------------------------------');

                            // !!! Use '--update' with caution !!!
                            if (edited && process.argv[3] === '--update') {
                                fs.writeFile(itemPath, bladeTemplateContent, 'utf8', err => {
                                    if (err) {
                                        console.error(`Error writing file: ${err}`);
                                    } else {
                                        console.log(`File ${itemPath} updated.`);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    // Start analyzing the directory
    analyzeDirectory(folderPath);

    function getTranslatedStrngs(str) {
        // const strings = getControllerStrings();
        // const strings = getCmsEditorString();
        const strings = getCanonString();

        // const entry = Object.entries(strings).find(([key, value]) => value.toLowerCase() === str.toLowerCase());
        const entry = Object.entries(strings).find(([key, value]) => value === str);
        return entry ? entry[0] : null;
    }

    function getCanonString() {
        return {
            'back_link': 'Zurück zur Liste',

            'workshop.error': 'Fehler',
            'workshop.notfound': 'Der Workshop konnte leider nicht gefunden werden. Bitte wende dich an deinen Workshop-Trainer für weiteren Support.',
            'description': 'Beschreibung',
            'firstname': 'Vorname',
            'lastname': 'Nachname',
            'email': 'E-Mail-Adresse',
            'equipment': 'Equipment',
            'image': 'Foto',
            'comment': 'Kommentar',
            'optional': 'optional',

            'workshop.image.datapolicy.text.before': 'Durch Anklicken stimme ich zu, dass mein Name mit meinem Foto veröffentlicht werden. Ich habe die',
            'workshop.image.datapolicy.link': 'Nutzungsbedingungen',
            'workshop.image.datapolicy.text.after': 'gelesen und akzeptiere diese.',
            'form.reset': 'Felder leeren',
            'form.submit': 'OK',
            'form.feedback.submit': 'Feedback senden',

            'workshop.levels.select': '-- Bitte wählen --',
            'level.all': 'Alle Erfahrungslevel',
            'level.beginners': 'Einsteiger',
            'level.beginners_and_advanced': 'Einsteiger & Fortgeschrittene',
            'level.photoimpressed': 'Fotobegeistert',
            'level.advanced': 'Fortgeschrittene',
            'level.expert': 'Profi',

            'workshop.workshoptopic.select': 'Allen Themen',
            'workshop.cities.select': 'Alle Veranstaltungsorte',
            'workshop.organizer.select': '-- Keiner ausgewählt --',

            'workshop.types.select': 'Alle Kategorien',
            'workshop.types.workshop': 'Workshop|Workshops',
            'workshop.types.travel': 'Fotoreise|Fotoreisen',
            'workshop.types.lecture': 'Vortrag|Vorträge',
            'workshop.types.event': 'Event|Events',
            'workshop.types.webinar': 'Webinar|Webinare',
            'workshop.types.online_workshop': 'Online-Workshop|Online-Workshops',

            'workshop.headline.awaits': 'Das erwartet dich',
            'workshop.headline.bring': 'Das solltest du mitbringen',
            'workshop.headline.learning': 'Lernziel',
            'workshop.discount.rel': 'Prozentual',
            'workshop.discount.abs': 'Absolutrabatt',
            'workshop.booking_info1': 'Es handelt sich um einen',
            'workshop.booking_info.academy': 'Canon Academy Workshop',
            'workshop.booking_info.partner': 'Partner-Workshop',
            'workshop.booking_info2.academy': 'Bei Klick auf den Button wirst du zu TICKETMACHINE weitergeleitet',
            'workshop.booking_info2.partner': 'Bei Klick auf den Button wirst du zu TICKETMACHINE weitergeleitet',

            'webinar.booking_info1': 'Es handelt sich um ein',
            'webinar.booking_info.academy': 'Canon Academy Webinar',
            'webinar.booking_info.partner': 'Partner-Webinar',
            'webinar.booking_info2.academy': 'Bei Klick auf den Button wirst du zu Edudip weitergeleitet',
            'webinar.booking_info2.academy.edudip': 'Bei Klick auf den Button wirst du zu Edudip weitergeleitet',
            'webinar.booking_info2.academy.youtube': 'Bei Klick auf den Button wirst du zu YouTube weitergeleitet',
            'webinar.booking_info2.partner': 'Bei Klick auf den Button wirst du zu Partnerseite weitergeleitet',
            'webinar.booking_info2.partner.edudip': 'Bei Klick auf den Button wirst du zu Edudip weitergeleitet',
            'webinar.booking_info2.partner.youtube': 'Bei Klick auf den Button wirst du zu YouTube weitergeleitet',
            'webinar.booking_info2.youtube': 'Bei Klick auf den Button wird die Aufzeichnung von YouTube geöffnet',

            'teaser.tags.startpage': 'Startseite: HeroSlider',
            'teaser.tags.startpage-promo': 'Startseite: Teaserkacheln',
            'teaser.tags.workshop': 'Workshop-Übersicht/-Detail: Dreierkacheln',
            'teaser.tags.trainer': 'Trainer-Übersicht: Dreierkacheln',
            'teaser.tags.knowhow': 'Know-How: Teaserkacheln',
            'teaser.tags.coaching': 'Coaching: Dreierkacheln',
            'teaser.tags.topic': 'Workshop-Themen: Dreierkacheln',
            'teaser.tags.workshoplist': 'Workshop-Übersicht: Listen-Teaser',
            'teaser.tags.webinarlist': 'Webinar-Übersicht: Listen-Teaser',
            'teaser.tags.cashback': 'Workshop-/Webinar-Übersicht: Cashback-Teaser',
            'teaser.tags.trainer-testimonial': 'Startseite: Trainer Testimonials',

            'teaser.positions.top': 'Erste Position',
            'teaser.positions.upper': 'Oberes Drittel',
            'teaser.positions.middle': 'Mitte',
            'teaser.positions.lower': 'Unteres Drittel',
            'teaser.positions.bottom': 'Letzte Position',

            'teaser.target.top': 'Selbes Fenster',
            'teaser.target.blank': 'Neues Fenster',

            'teaser.text_color.white': 'Weiß',
            'teaser.text_color.dark': 'Dunkel',

            'teaser.pill_color.gray': 'Grau',
            'teaser.pill_color.white': 'Weiß',
            'teaser.pill_color.lightblue': 'Hellblau',
            'teaser.pill_color.red': 'Rot',

            'teaser.text_align.left': 'Linksbündig',
            'teaser.text_align.center': 'Zentriert',
            'teaser.text_align.right': 'Rechtsbündig',

            'userphotos.title': 'Impressionen aus unseren Workshops',
            'userphotos.description': 'In unserer Galerie findest du Fotos unserer Workshop-Teilnehmer und Trainer. Lasse Dich inspirieren!',

            /*
            * Startseite
            */
            'startpage.head.title': 'Willkommen bei der',
            'startpage.head.text1': 'Wir teilen deine Begeisterung für Bilder. Und mit derselben Begeisterung teilen wir unser Wissen und unsere Erfahrung. Lass dich von unseren Angeboten inspirieren und mache den nächsten Schritt.',
            'startpage.head.text2': 'Fotoworkshops und Coaching',
            'startpage.head.text3': 'Die Canon Academy hilft dir, deinen eigenen Stil zu entwickeln: durch Live-Foto-Workshops, individuelles Coaching, Expertentipps, zahlreiche Canon Events und Fotoreisen. Professionelle Trainer vermitteln dir Wissen, Methoden und geben dir eine Fülle von Werkzeugen an die Hand. Vom Anfänger- bis zum Profilevel.',
            'startpage.head.text4': 'Denn die nächste Geschichte wartet schon auf dich ...',
            'startpage.head.text5_prefix': 'Get ready ',
            'startpage.head.text5': 'for your story_',
            'startpage.usergallery.title': 'Impressionen aus unseren Workshops',
            'startpage.userphotos.title': 'Academy-Fotogalerie',
            'startpage.userphotos.description': 'Die Canon Academy-Galerie ist der Platz für eure Bilder. Lass dich von den Fotos unserer Workshopteilnehmer und Trainer inspirieren und schicke uns deine schönsten Fotos aus deinem Canon Academy-Workshop zur Veröffentlichung auf unserer Homepage.  <a href=":link">Hier</a> erfährst du wie.',

            /*
            * Workshop Finder
            */
            'workshopfinder.title': 'In wenigen Klicks zum Ziel',
            'workshopfinder.text': 'Ob Einsteiger oder Experte: Die Workshops der Canon Academy bieten dir auf jedem Level die Möglichkeit, dein Wissen und deine Fähigkeiten mit Fotokursen zu erweitern. Finde hier den Workshop, der dich begeistert.',
            'workshopfinder.submit': 'Workshops anzeigen',

            /*
            * Webinar
            */
            'webinar.title': 'Webinare',
            'webinar.retailer.title': 'Händler Webinare',
            'webinar.index.title': 'Wissen und Inspiration kompakt',
            
            'webinar.index.workshop_slider_text': 'Die nächsten Angebote',

            /*
            * Workshop
            */
            'workshop.codearea': 'Geschützer Bereich',
            'workshop.title': 'Fotoworkshops',
            'workshop.text1': 'Die Canon Academy unterstützt Dich dabei, Deinen Stil zu finden und weiterzuentwickeln: Bei Live-Workshops, mit einem individuellen Coaching, bei Events und Fotoreisen kannst du deine visuellen Fähigkeiten erweitern und verfeinern.',
            'workshop.text2': 'Die Canon Academy holt Dich dort ab, wo du mit Deiner Fotografie stehst. Als Einsteiger, der die ersten Schritte gehen möchte, machen wir Dich praxisnah mit den Grundlagen der Fotografie vertraut. Fortgeschrittene Fotografen, die ihr Können verbessern wollen, zum Beispiel in der Makrofotografie, beim Blitzen oder in der Natur- und Wildlife-Fotografie, profitieren unmittelbar vom Experten-Know-how unserer Trainer. Denn das Team der Canon Academy ist mit derselben Leidenschaft für Fotografie unterwegs wie du selbst. Die Trainer haben umfangreiches Canon Leihequipment dabei – nutze die Möglichkeit, mit neuen Werkzeugen zu arbeiten und Deiner Story eine neue Perspektive zu geben. Denn die nächste Geschichte wartet schon auf Dich.',

            'workshop.workshopfinder.title': 'Foto Workshopfinder',
            'workshop.workshopfinder.text1': 'In dem breiten Fotoworkshop-Angebot der Canon Academy vermittelt unser Trainerteam dieses Wissen spielerisch und mit großem Enthusiasmus. Denn wir teilen deine Leidenschaft für die Fotografie. Deshalb steht auch nicht nur das „Fotografieren lernen“ im Vordergrund unserer Fotokurse. Entdecke mit der Canon Academy den Zauber verlassener Orte und außergewöhnliche Locations. Oder steige in die Sportfotografie ein und fange mit deiner Kamera spannende Situationen beim Fußball oder Volleyball ein.',

            'workshop.workshopslider.title': 'Weitere Workshops',
            'workshop.slider.this_may_interest': 'Diese Angebote könnten dich interessieren',
            'workshop.slider.other_workshops_webinars': 'Weitere Workshops und Webinare',
            'workshop.slider.discover': 'Entdecke weitere aktuelle Angebote',
            'workshop.event.title': 'Dieser Workshop ist Teil des Events|Dieser Workshop ist Teil der Events',
            'workshop.impressions.title': 'Entdecke Impressionen aus vorherigen Workshops',

            'workshop.show.title.postfix': ' - Canon Academy',
            'workshop.show.description.prefix': 'Lerne von Profi-Fotografen in unserem ',
            'workshop.show.description.infix': ' zum Thema "',
            'workshop.show.description.postfix': '" ✔️ Jetzt buchen!',

            /*
            * USP Teaser
            */
            'workshop.workshopfinder.iconteaser_title': 'Deine Vorteile mit der Canon Academy',

            'workshop.workshopfinder.iconteaser_1': 'Kameras und Objektive zum Testen bei Vor-Ort-Workshops',
            'workshop.workshopfinder.iconteaser_2': 'Angebote für jedes Erfahrungs-Level',
            'workshop.workshopfinder.iconteaser_3': 'Professionelles Trainer-Team',
            'workshop.workshopfinder.iconteaser_4': 'Online-Angebote live und 24/7 verfügbar',
            'workshop.workshopfinder.iconteaser_5': 'Schulungsunterlagen zum Download',
            'workshop.workshopfinder.iconteaser_6': 'Vor-Ort-Workshops in deiner Nähe',

            /*
            * Workshop Teaser
            */
            'workshop.workshopteaser.heading':    'Unsere Top Empfehlungen',
            'workshop.workshopteaser.text':       'Unsere Top 4 Empfehlungen',
            'workshop.workshopteaser.textlink':   'Alle Workshops anzeigen',

            /*
            * userconent
            */
            'usercontent.title': 'Die Canon Academy stellt sich vor',
            'usercontent.text': 'Fotografie ist unsere Leidenschaft. Diese Begeisterung wollen wir mit dir teilen. Entdecke in diesem Video, was die Canon Academy auszeichnet. Erhalte die Grundlagen der Fotografie von unseren Experten. Bekomme wertvolle Tipps von unseren Trainern und Partnern, die dir dabei helfen, mithilfe deiner Kamera noch bessere Geschichten zu erzählen.',

            /*
            * Coaching Request
            */
            'coaching.thankyou': 'Vielen Dank für deine Anfrage, wir werden diese zeitnah beantworten.',

            /*
            * EXIF
            */
            'model': 'Kamera',
            'lens': 'Objektiv',
            'exposuretime': 'Belichtungszeit',
            'focallength': 'Brennweite',
            'isospeedratings': 'ISO',
            'fnumber': 'Blende',

            'image_title': 'Titel',
            'image_topic': 'Thema',
            'image_author': 'Fotograf',

            /*
            * Footer
            */
            'footer.newsletter.title': 'Canon-Community',
            'footer.newsletter.text': 'Erfahre immer als Erster mehr zu interessanten Canon Academy Angeboten und Canon Produktneuheiten.',
            'footer.newsletter.button': 'Jetzt mit Canon ID starten',
            'footer.contact.title': 'Schreibe uns',
            'footer.contact.button': 'Kontakt',
            'footer.socialmedia.title': 'Folge uns',

            /*
            * Know-How
            */
            'knowhow.knowledge.title': 'Fotowissen für die Praxis',
            'knowhow.knowledge.text': 'Am Ende zählt das gute Bild, aber auf dem Weg dorthin spielt die Technik eine wichtige Rolle. Die Canon Academy hilft dir mit den Academy-Leitfäden und Video-Tutorials dabei, dein Wissen auch von zu Hause aus zu erweitern. Die Wahl des richtigen Objektivs oder Blenden- und Belichtungseinstellung wird für dich dadurch beherrschbar.',
            'knowhow.guides.title': 'Academy Leitfäden',
            'knowhow.guides.text1': 'Du suchst den Einstieg in ein fotografisches Thema oder willst mehr über ein bestimmtes Fotogebiet, zum Beispiel Makrofotografie, erfahren? Die Academy-Leitfäden liefern dir Grundlagen dafür und geben auch Tipps, wie du deine Ausrüstung optimal ergänzen kannst.',
            'knowhow.guides.text2': 'Die Canon „Belichtungsfibel“ gibt dir außerdem kurz und knapp einen Überblick rund um das Thema Belichtung – ideal auch für unterwegs!',
            'knowhow.guides.text3': 'Jetzt hier kostenlos downloaden.',
            'knowhow.index.headline': 'Canon Academy Infothek',
            'knowhow.index.text1': 'Erweitere dein Wissen Schritt für Schritt. Wähle ein Thema, das dich interessiert und ein Format, das zu dir passt. Die Tipps & Tricks sind Problemlöser und bieten dir Hilfe und Anregungen – jede Woche neu. In den Academy Hacks und Talks kommen Canon Experten zu Wort. Unsere PDF-Leitfäden zum Download bieten einen ausführlichen Einstieg zu verschiedenen fotografischen Themen oder zu Canon Produkten.',
            'knowhow.index.text2': 'Lass dich inspirieren!',
            'knowhow.overview.topic.title': 'Leitfäden zum Thema :topic',
            'knowhowdownload.illegal.action': 'Die aufgerufene Seite konnte nicht gefunden werden. Sie wurden auf die Übersichtsseite weitergeleitet.',


            /*
            * Youtube Slider
            */
            'youtubeslider.title': 'Die Academy stellt sich vor',
            'youtubeslider.text': 'Einfach erklärt: Auf dem Canon YouTube-Kanal findest du Videos von attraktiven Canon Academy Workshops. Dort findest du auch Kurzvideos zum Thema Fotografie.',

            /*
            * Trainers
            */
            'trainers': 'Trainer',
            'trainers.title': 'Die Canon Academy-Trainer',
            'trainers.text1': 'Die freien Trainer der Canon Academy lieben Foto- und Videografie. Jeder von ihnen hat seine eigene Geschichte, seinen Stil, sein Lieblingsequipment. Was alle gemeinsam haben: Leidenschaft für die Fotografie. Ihre Erfahrung wird dich inspirieren, deine Geschichten noch spannender zu erzählen.',
            'trainers.head2': 'Das Fotografie-Erlebnis teilen',
            'trainers.text3': 'Die freien Trainer der Canon Academy lieben Foto- und Videografie. Jeder von ihnen hat seine eigene Geschichte, seinen Stil, sein Lieblingsequipment. Was alle gemeinsam haben: Leidenschaft für die Fotografie. Lass dich von neuen Erfahrungen und zusätzlichem Know-how inspirieren und begeistern. Bringe deine individuellen Fragen und Wünsche mit in die Workshops und erweitere deine Fähigkeiten gemeinsam mit den Trainern in Theorie und Praxis.',
            'trainers.text4': 'Durch die langjährige Zusammenarbeit mit Canon und regelmäßige Schulung sind unsere Trainer immer auf dem neuesten Stand hinsichtlich Know-how, Technik und Ausrüstung.',


            'trainers.equipment.title': 'Lieblings-Equipment',
            'trainers.equipment.description': '',

            'trainers.show.title.postfix': ', Trainer - Canon Academy',
            'trainers.show.description.prefix': 'Erfahre mehr über ',
            'trainers.show.description.postfix': ': Als Trainer der Canon Academy leitet er inspirierende Fotografie-Workshops ✔️ Jetzt anmelden!',
            'trainers.show.mainheadline': ': Trainer der Canon Academy',

            /*
            * About Us
            */
            'aboutus.title': 'What\'s your story?',
            'aboutus.text1': 'Storytelling mit Fotografie: Jedes Foto erzählt eine Geschichte. Aber was macht deine Geschichte besonders? Die Canon Academy hilft dir, deinen eigenen Stil zu entwickeln: durch Workshops, individuelle Coachings, Expertentipps, auf Events oder Fotoreisen. Professionelle Trainer vermitteln dir Fotowissen, Methoden und geben dir eine Fülle von Werkzeugen an die Hand. Vom Anfänger- bis zum Profilevel.',
            'aboutus.text2': 'Denn die nächste Geschichte wartet schon auf dich ...',

            'aboutus.title2': 'Das breite Academy-Angebot',

            'aboutus.workshops.title': 'Fotoworkshops',
            'aboutus.workshops.text1': 'Unsere Workshops werden von erfahrenen Trainern durchgeführt, die zudem über ein umfangreiches Canon Equipment zum Testen verfügen. Lass dich inspirieren und experimentiere mit deiner Kamera. Im Workshopkalender findest du unsere Fotokurse, die dir dabei helfen, den nächsten Schritt zu machen.',
            'aboutus.workshops.text2': 'Im Workshopkalender findest du unsere Fotokurse, die dir dabei helfen, den nächsten Schritt zu machen.',
            'aboutus.workshops.button': 'Zu den Workshops',

            'aboutus.coaching.title': 'Individuelle Coachings',
            'aboutus.coaching.text1': 'Dieses exklusive Angebot ermöglicht ein maßgeschneidertes Foto-Coaching, das individuell und in enger Abstimmung mit unserem Trainer-Team geplant wird. Eins zu eins oder in einer Gruppe, als Privatperson oder als Unternehmen.',
            'aboutus.coaching.button': 'Zum Coaching',

            'aboutus.travel.title': 'Fotoreisen',
            'aboutus.travel.text1': 'Gemeinsam mit ausgewählten Partnern bietet die Canon Academy spannende Fotoreisen zu verschiedenen Orten an. Mache dich gemeinsam mit der Canon Academy auf die Suche nach den besten Motiven auf dieser Welt.',
            'aboutus.travel.button': 'Zu den Fotoreisen',

            'aboutus.expert.title': 'Canon Academy Expertentipps',
            'aboutus.expert.text': 'Lust auf eine Portion Fotowissen, das du bequem zu Hause oder unterwegs abrufen kannst? Dann nutze unser kostenloses Know-how Download-Angebot : die „Belichtungsfibel“ oder die Academy-Leitfäden zur Technik und Anwendungen aus unterschiedlichen Fotogebieten.',

            'aboutus.partners.title': 'Unsere Partner',

            /*
            * Impressionen / Gallery
            */
            'impressions': 'Impressionen',
            'impressions.text': 'Bilder erzählen Geschichten und haben ihre individuelle Sprache. In der Galerie zeigen wir Geschichten, die unsere Trainer fotografiert haben und hervorragende Bilder, die die Workshop-Teilnehmer festgehalten haben. Lass dich inspirieren und werde Teil der Academy-Community – beim nächsten Besuch könnte dein bestes Foto mit dabei sein.',

            /*
            * Contests
            */
            'contest.title': 'Wettbewerbe',
            'contest.slider.title': 'Unsere Wettbewerbe',
            'contest.gallery_info.contest_title': 'Wettbewerb',
            'contest.gallery_info.photographer': 'Fotograf',
            'contest.gallery_info.winner_ranking': 'Platz',
            'contest.submit': 'Jetzt mitmachen',
            'contest.terms_of_participation': 'Teilnahmebedingungen',
            'contest.data_policy': 'Datenschutzerklärung',
            'contest.terms_of_use': 'Nutzungsbedingungen',
            'contest.data_policy_and_terms_of_participation': 'Datenschutzerklärung und Teilnahmebedingungen',
            'contest.newsletter': 'Newsletter',

            'workshop.gallery.title': 'Impressionen',
            'gallery': 'Workshop-Galerien',

            /*
            * Individual Coaching
            */
            'widget.coaching.title': 'Coaching',
            'widget.coaching.text': 'Du möchtest dein Fotowissen individuell vertiefen – zu HDR oder RAW-Fotografie, Bildgestaltung oder dem „goldenen Schnitt“der Fotografie? Oder ein spezielles Interessensgebiet wie Sportfotografie zusammen mit einem Trainer der Canon Academy erweitern?',
            'widget.coaching.text2': 'Dann ist ein Einzel- oder Gruppen-Coaching mit einem Canon Academy-Trainer die ideale Lösung. Dieses exklusive Angebot der Canon Academy ermöglicht dir, ein maßgeschneidertes Coaching – eins zu eins, mit einer Gruppe oder für Unternehmen – zu planen und in enger Abstimmung mit unserem Team durchzuführen.',
            'widget.coaching.button': 'Coaching anfragen',
            'widget.coaching.button2': 'Zum Coaching',

            'coaching.title': 'Ein Coaching, das auf deine Bedürfnisse abgestimmt ist',
            'coaching.subtitle': 'Du möchtest dein Fotowissen individuell vertiefen oder ein spezielles Interessengebiet – wie zum Beispiel Makrofotografie –  zusammen mit einem Trainer der Canon Academy erweitern? Dann ist ein Einzel- oder Gruppen-Coaching mit einem Canon Academy-Trainer die perfekte Lösung.',

            'coaching.section1.title': 'So individuell wie deine Bildideen',
            'coaching.section1.text': 'Dieses exklusive Angebot ermöglicht es, ein maßgeschneidertes Coaching – eins zu eins oder in einer Gruppe – zu planen und in enger Abstimmung mit unserem Trainer-Team durchzuführen.',

            'coaching.section2.title': 'Auf den Punkt geplant',
            'coaching.section2.text': 'Unsere Einzel- oder Gruppen-Coachings bieten dabei Vorteile und Möglichkeiten, die über die Standardtrainingsmodule der Canon Academy zu Fotografie- und Videothemen hinausgehen. Bei der individuellen Begleitung unserer Trainer arbeitest du auf Wunsch mit deiner eigenen Ausrüstung oder mit aktuellen Canon Kameras und -Objektiven.',

            'coaching.section2.list.1': 'Du bestimmst das Thema, z. B. Makrofotografie, Portrait oder DSLR-Video',
            'coaching.section2.list.2': 'Du legst Termin, Dauer und Ort des Coachings fest',
            'coaching.section2.list.3': 'Du wählst deinen Wunschtrainer',
            'coaching.section2.list.4': 'Du bestimmst die Anzahl der Teilnehmer (maximal 8)',
            'coaching.section2.list.5': 'Du besprichst mit dem Trainer die erforderliche Ausrüstung',
            'coaching.section2.list.6': 'In Absprache mit dem Trainer erstellen wir dir ein individuelles Angebot',

            'coaching.section4.title': 'Weitere Informationen und Buchung',
            'coaching.section4.text': 'Für weitere Informationen und Buchungen nimm bitte direkt Kontakt zu unserem Academy-Team auf:',

            'coaching.section5.title': 'Faire Konditionen',
            'coaching.section5.text': 'Abhängig von der Dauer des Trainings bieten wir dir ein Individual-Coaching zu den folgenden Kosten an:',
            'coaching.section5.list.1': '1/1 Tag (6 Stunden) 800 €',
            'coaching.section5.list.2': 'mehrtägige Coachings nach Absprache',
            'coaching.section5.list.3': 'Coaching per Telefon: 30 Minuten ab 50 €',

            'coaching.contact.title': 'Coaching anfragen',
            'coaching.contact.subline': 'Für weitere Informationen und Buchungen nimm bitte direkt Kontakt zu unserem Academy-Team auf:',
            'coaching.contact.formtext': 'Felder mit einem * sind Pflichtfelder',

            /*
            * Kampagne overview
            */
            'campaign': 'Hacks',
            'campaign.overview.title': 'Canon Academy Hacks: Praxis pur',
            'campaign.overview.subtitle': '',
            'campaign.overview.intro.title': 'Willkommen bei den Canon Academy Hacks',
            'campaign.overview.intro.text': 'In den Canon Academy Hacks geben Experten Tipps zu Canon Kameras, Objektiven und Zubehör. Die Hacks zeigen dir anschaulich, wie du mit Canon in der Praxis bessere Ergebnisse erzielst.<br><br>Lasse dich inspirieren und verbessere mit der Canon Academy Schritt für Schritt deine kreativen und technischen Fähigkeiten.',
            'campaign.campaign_teaser.read_more': 'Erfahre hier mehr',
            'campaign.teasers.read_more': 'Zum Step by Step Tutorial',
            'campaign.overview.topic.title': 'Hacks zum Thema :topic',

            'campaign.show.title.postfix': ' - Canon Academy',
            'campaign.show.description.postfix': ' - Wir verraten, wie es funktioniert! ✔️ Mehr erfahren!',

            'tutorial': 'Tutorials',
            'tutorial.play_video': 'Video abspielen',
            'tutorial.workshops.title': 'Passende Workshops',
            'tutorial.back_link': 'Zurück zur Übersicht',

            /*
            * Talks overview
            */
            'talks': 'Talks',
            'talks.overview.title': 'Talks',
            'talks.overview.subtitle': '',
            'talks.overview.intro.title': 'Willkommen bei den Canon Academy Talks',
            'talks.overview.intro.text': 'Bei den Talks geht es um Foto- und Videothemen und wie du sie für dich erschließen kannst. Die Gespräche zwischen Anwendern und Fotografen oder Produktspezialisten vermitteln auf unterhaltsame Weise spannende Einblicke in neue Themenwelten.<br><br>Lasse dich inspirieren und verbessere mit der Canon Academy Schritt für Schritt deine kreativen und technischen Fähigkeiten.',
            'talks.campaign_teaser.read_more': 'Erfahre hier mehr',
            'talks.talks_teaser.read_more': 'Erfahre hier mehr',
            'talks.overview.topic.title': 'Talks zum Thema :topic',

            'talktopic': 'Talk Topics',
            'talktopic.play_video': 'Video abspielen',
            'talktopic.workshops.title': 'Passende Workshops',
            'talktopic.back_link': 'Zurück zur Übersicht',

            /*
            * FAQ
            */
            'faq.title': 'Kontakt',
            'faq.text': 'Du hast Fragen rund um das Canon Academy-Angebot? Vielleicht findest du schon hier die Antwort.',

            /*
            * Email
            */
            'email.contact.subject': 'Canon Academy Kontakt Anfrage',
            'email.coaching.subject': 'Canon Academy Coaching Anfrage',

            /*
            * Contact form
            */
            'contact.form.headline': 'Wie können wir dir helfen?',
            'contact.form.sub_headline_1': 'Vielen Dank für dein Interesse an der Canon Academy! Hier kannst du deine Fragen, Ideen und Anregungen rund um unsere Angebote loswerden.',
            'contact.form.sub_headline_2': 'Hast du Fragen zu unserem Programm? Vermisst du ein Thema, das dir wichtig ist? Oder gibt es ein Problem bei der Buchung eines Workshops oder eines Webinars?',
            'contact.form.sub_headline_3': 'Dann bist du hier genau richtig! Bitte fülle das Kontaktformular aus, damit wir uns schnellstmöglich um dein Anliegen kümmern können.',
            'contact.form.success': 'Ihre Anfrage wurde erfolgreich weitergereicht.',
            'contact.form.name': 'Name',
            'contact.form.mail': 'E-Mail',
            'contact.form.message': 'Deine Nachricht an uns',
            'contact.form.note_headline': 'Hinweis',
            'contact.form.note_1': 'Wenn du technische Hilfe für ein Canon Produkt benötigst oder eine Wartung oder Reparatur in Auftrag geben möchtest, dann wende dich bitte direkt an den Canon Support:',
            'contact.form.submit': 'Senden',

            /*
            * Code
            */
            'code.general.download_policy_text': 'Die Schulungsunterlagen sind Eigentum der Canon Academy und nur für die private, also nicht gewerbliche und nicht öffentliche Nutzung gedacht. Es ist daher nicht gestattet, die Unterlagen im Ganzen oder einzelne Teile davon zu vervielfältigen oder zu verbreiten.',

            'code.workshop.feedback.title': 'Wie wär’s mit einem kurzen Feedback?',
            'code.workshop.feedback.description': ' Wir versuchen unsere Trainings immer weiter zu verbessern und ein kurzes Feedback würde uns dabei sehr helfen!',
            'code.workshop.feedback.question': 'Wie zufrieden warst du mit diesem Kurs?',
            'code.workshop.feedback.thanks': 'Vielen Dank für Ihre Bewertung!',

            'code.workshop.download.title': 'Downloads zum Workshop',

            'code.workshop.gallery.title': 'Workshop Galerie',

            'code.workshop.upload.title': 'Eigene Bilder hochladen ',
            'code.workshop.upload.description': 'Zeige uns dein Lieblingsfoto aus dem Workshop.',
            'code.workshop.upload.required': '* sind Pflichtfelder',

            'code.webinar.download.title': 'Downloads zum Webinar',
            'code.webinar.feedback.title': 'Wie wär’s mit einem kurzen Feedback?',
            'code.webinar.feedback.description': ' Wir versuchen unsere Webinare immer weiter zu verbessern und ein kurzes Feedback würde uns dabei sehr helfen!',
            'code.webinar.feedback.question': 'Wie zufrieden warst du mit diesem Webinar?',
            'code.webinar.feedback.thanks': 'Vielen Dank für Ihre Bewertung!',

            /*
            * Content-user
            */
            'contentuser.profile.welcome': 'Übersicht über Ihr Kundenkonto!',

            /*
            * Event
            */
            'event.title': 'Events',
            'event.description': 'Unsere Events sind Highlights im Academy Kalender und bieten dir immer eine besondere Erfahrung. Profitiere von den interessanten Aktionen und exklusiven Promotions, die wir zum Teil gemeinsam mit Partnern organisieren. Erlebe das Academy-Team live vor Ort bei Veranstaltungen oder auf Roadshows und Messen. Außerdem hast du bei vielen Events die Möglichkeit, die neuesten Canon Kameras und Objektive auszuprobieren.',
            'event.no_entries': 'Es konnten keine passenden Einträge gefunden werden.',
            'event.button': 'Zum Event',
            'event.event-finder.title': 'Das breite Academy-Angebot',

            'event.slider.title': 'Weitere Events',
            'event.workshops.title': 'Workshops und Webinare des Events',
            'event.workshops.count_title': 'Veranstaltung|Veranstaltungen',
            'event.overview.topic.title': 'Events zum Thema :topic',

            /*
            * Thank-You
            */
            'thankyou.newsletter.title': 'Vielen Dank für dein Abonnement.',
            'thankyou.newsletter.description': 'Vielen Dank für die Anmeldung zum Newsletter',

            'thankyou.whitepaper.description': 'Hier findest du unsere Academy-Leitfäden in voller Länge.',

            /*
            * Preview Nav
            */
            'preview.back_to_list': 'Zurück zur Übersicht',
            'preview.go_to_edit': 'Bearbeiten',
            'preview.activate': 'Freigeben',

            /*
            * Lecture
            */
            'lecture.show.title.prefix': ' Vortrag: ',
            'lecture.show.title.postfix': ' - Canon Academy',
            'lecture.show.description.prefix': 'Lerne von Profi-Fotografen in unserem Vortrag zum Thema "',
            'lecture.show.description.postfix': '" ✔️ Jetzt buchen!',

            /*
            * Travel
            */
            'travel.show.description.prefix': 'Lerne von Profi-Fotografen in unserer ',

            /*
            * Webinar
            */
            'webinar.workshopslider.title': 'Weitere Workshops',
            'webinar.show.learnings': 'Learnings',
            'webinar.show.knowledge': 'Kenntnisse',
            'webinar.show.agenda': 'Agenda',
            'webinar.show.go_to_webinar_link.canon': 'Webinar buchen',
            'webinar.show.go_to_webinar_link.partner': 'Partner-Webinar buchen',
            'webinar.show.view.canon': 'Webinar ansehen',
            'webinar.show.view.partner': 'Partner-Webinar ansehen',
            'webinar.events.title': 'Dieses Webinar ist Teil des Events|Dieses Webinar ist Teil der Events',

            'webinar.show.title.postfix': ' - Canon Academy',
            'webinar.show.description.prefix': 'Lerne von Profi-Fotografen in unserem ',
            'webinar.show.description.infix': ' zum Thema "',
            'webinar.show.description.postfix': '" ✔️ Jetzt buchen!',

            'to_book': ':name buchen',
            'to_book_partner': 'Partner-Workshop buchen',
            'sold_out': 'Ausgebucht',

            'tipps_tricks.read_time': 'Lesedauer ca. :minutes Minute|Lesedauer ca. :minutes Minuten',

            'trainer.designation.trainer': 'Trainer',
            'trainer.designation.guest_lecturer': 'Gastdozent',
            'trainer.designation.technical_marketing': 'Technisches Marketing',
            'trainer.designation.ambassador': 'Canon Ambassador',

            'trainer.designation.none': '',
            'trainer.designation.no_designation_text': 'Keine Bezeichnung',

            /*
            * Topics
            */
            'topic.show.title.postfix': ' - Canon Academy',
            'topic.show.description.prefix': 'Canon bietet ein breites Weiterbildungsangebot zum Thema ',
            'topic.show.description.postfix': ' ✔️ Jetzt entdecken!',

            /*
            * Glossar
            */
            'glossary': 'Glossar',
            'glossary.suggestion.email': 'glossar@canon-academy.de',

            /*
            * Main headlines
            */
            'workshop.mainheadline': 'Foto- und Videoworkshops',
            'online_workshop.mainheadline': 'Online-Workshop',
            'webinar.mainheadline': 'Webinare',
            'lecture.mainheadline': 'Vorträge',
            'travel.mainheadline': 'Fotoreisen',
            'program.mainheadline': 'Das Programm der Canon Academy',
            'knowhow.mainheadline': 'Leitfäden: Fotografie, Kameras & Videografie',
            'campaign.mainheadline': 'Hacks & Tipps für Canon Kameras, Objektive und Zubehör',
            'talks.mainheadline': 'Expertentalks: Fotografie, Videografie & mehr',
            'dashboard.mainheadline': 'Fotografie erleben mit der<br>Canon Academy',
            'info_library.mainheadline': 'Infothek der Canon Academy',
            'trainer.mainheadline': 'Trainer und Experten der Canon Academy',
            'about_us.mainheadline': 'Über Uns',
            'contact.mainheadline': 'Der direkte Draht zur Canon Academy',

            'topic': "Thema",
            'topics': "Themen",

            // Tamar

            'partner.robinson.alt': 'Logo unseres Partners Robinson',
            'partner.haida.alt': 'Logo unseres Partners Haida',
            'partner.weltvogelpark.alt': 'Logo unseres Partners Weltvogelpark',
            'partner.feisol.alt': 'Logo unseres Partners Feisol',
            'partner.urbanana.alt': 'Logo unseres Partners urbanana',

            'partner.wiener_fotoschule.alt': 'Logo unseres Partners Wiener Fotoschule',
            'partner.clever_fotografieren.alt': 'Logo unseres Partner Clever Fotografieren',

            'partner.fotoschule_baur.alt': 'Logo unseres Partners Fotoschule Baur',

            'admin.login.image.alt': 'Canon Academy Fotoworkshops',
            'password.reset.title': 'Passwort zurücksetzen',
            'password.reset.button': 'Zurücksetzen',

            
            'password.change.title': 'Passwort ändern',
            'password.reset.password.label': 'Passwort',
            'password.reset.confirm.label': 'Passwort bestätigen',
            'password.reset.requirements': 'Passwortanforderungen',
            'password.reset.requirements.list_1': 'mindestens 8 Zeichen lang',
            'password.reset.requirements.list_2': 'sowohl Groß- als auch Kleinbuchstaben',
            'password.reset.requirements.list_3': 'mindestens eine Ziffer (0-9) und ein Symbol',
            'password.reset.requirements.list_4': 'es darf kein Datum im Passwort enthalten sein',
            'password.reset.requirements.list_5': 'Das Passwort darf sich nicht auf einer Liste bekannter trivialer und/oder kompromittierter Passwörter befinden',
            'password.reset.success': 'Your password has been reset successfully.',


            'login.title': 'Login',
            'login.password.label': 'Password',
            'login.remember_me': 'Remember me',
            'login.forgot_password': 'Forgot Your Password?',


            'register.panel.heading': 'Register',
            'register.salutation.loabel': 'Anrede',
            'register.salutation.optin_mrs': 'Frau',
            'register.salutation.option_mr': 'Herr',
            'register.company.label': 'Unternehmen',
            'email': 'E-Mail',
            'register.password_confirm.label': 'Passwort wiederholen',


            'tutorial.like_question': 'Hat dir das Tutorial gefallen?',
            'tutorial.help_message': 'Wir hoffen, dir mit diesem Tutorial weitergeholfen zu haben und freuen uns über deine spannenden Ergebnisse unter dem Hastag',
            'tutorial.hashtag_link.title': 'CanonAcademy of Instagram',
            'tutorial.share_now': 'Jetzt Tutorial teilen!',
            

            'single_download.format_and_size': 'Format',
            'single_download.format_and_size_1': 'und Grösse',
            'single_download.download_button': 'Datei herunterladen',


            'workshop.upload.datapolicy_text': 'Mit dem Klick auf den nachfolgenden Button, erklären Sie sich damit einverstanden, dass die von Ihnen eingegebenen Angaben für die Beantwortung Ihrer Kontaktaufnahme verwendet werden. Mehr Informationen zu der Verwendung Ihrer Daten und Ihren Rechten mit Bezug auf die Verwertung und Löschung dieser Daten, erfahren Sie in unserer',
            
            
            'photoweek.title': 'Photoweek Berlin 2019',
            'upload.headline': 'Bild hochladen',
            'upload.subHeadline': 'Lade hier dein Foto für den „Live & Create“ Fotowettbewerb hoch (max. 20 MB).',
            'upload.datapolicyText': 'Mit dem Klick auf den nachfolgenden Button erklärst du dich damit einverstanden, dass deine Daten im Rahmen des Fotowettbewerbs verwendet werden. Mehr Informationen zu der Verwendung deiner Daten und deinen Rechten mit Bezug auf die Verwertung und Löschung dieser Daten, erfährst du in unserer',
            'upload.datapolicySlot.label_1': 'Ich habe die',
            'upload.datapolicySlot.label_2': 'gelesen und akzeptiere diese.*',
            'gallery.headline': 'Galerie',
            'gallery.subHeadline': 'Hier zeigen wir alle bisherigen Einsendungen von Teilnehmern des Canon „Live & Create“ Fotowettbewerbs im Rahmen der Berlin Photo Week 2019. Lass dich inspirieren!',
            'call_to_action.headline': 'Immer informiert bleiben',
            'call_to_action.subHeadline': 'Mit dem Canon YouConnect Newsletter',
            'call_to_action.button': 'Jetzt abonnieren',
            'image.alt': 'Canon Academy Newsletter',
            'modal.thanks.message': 'Herzlichen Dank für deine Teilnahme am Canon ‚Live & Create‘ Fotowettbewerb im Rahmen der Berlin Photo Week 2019.<br>Wir wünschen dir viel Erfolg!',
            
            'feedback.rating_1': 'Ausbaufähig',
            'feedback.rating_2': 'In Ordnung',
            'feedback.rating_3': 'Gut',
            'feedback.rating_4': 'Klasse!',
            'feedback.rating_5': 'Hervorragend',
            'feedback.personal_information': 'Persönliche Angaben',
            'feedback.data_privacy_notice': 'Mit dem Klick auf den nachfolgenden Button, erklären Sie sich damit einverstanden, dass die von Ihnen eingegebenen Angaben für die Beantwortung Ihrer Kontaktaufnahme verwendet werden. Mehr Informationen zu der Verwendung Ihrer Daten und Ihren Rechten mit Bezug auf die Verwertung und Löschung dieser Daten, erfahren Sie in unserer',
            

            'contact.where_is_workshop_code': 'Wo finde ich meinen Workshop-Code?',
            

            'contest.upload_image_alt': 'Wettbewerb Teilnehmer Upload - Canon Academy',


            'contest.participate_now': 'Jetzt teilnehmen',
            'contest.submit_photo_prompt': 'Um am Wettbewerb teilzunehmen, reiche über das folgende Formular dein Foto (max. :max_upload_size MB) ein.',
            'contest.terms_agreement': 'Durch Anklicken stimme ich zu, die ',
            'contest.terms_agreement_end': ' gelesen zu haben und akzeptiere diese.',
            'contest.uploading_animation_text': 'Dein Foto wird eingereicht. Dies kann ein paar Sekunden dauern.',
            'contest.modal_close_button': 'Verstanden',
            

            'contest.no_contests': 'Aktuell gibt es keine Wettbewerbe. Schau doch in der nächsten Zeit nochmal vorbei.',
            

            'contest.co_partner': 'Co-Partner',
            'contest.ended': 'Der Wettbewerb ist beendet.',
            'contest.start': 'Start',
            'contest.end': 'Ende',
            'contest.thank_you': 'Vielen Dank für deine Teilnahme!',
            'contest.running_prizes': 'Diese Preise kannst du gewinnen',
            'contest.ended_prizes': 'Diese Preise gab es zu gewinnen',
            'contest.winner_photos': 'Dies sind die Gewinner-Fotos',
            'contest.running_uploads': 'Bisherige Teilnehmer-Uploads',
            'contest.ended_uploads': 'Teilnehmer-Uploads',


            'contest.success_text_fallback': 'Dein Foto wurde erfolgreich eingereicht. Sobald es von uns geprüft und freigegeben wurde, wird es auf der Wettbewerb-Seite mit den anderen Teilnehmer-Fotos erscheinen.',
            'contest.back_to_contest': 'Zurück zum Wettbewerb.',


            'top_categories.title': 'Unsere Top Themen',
            'trainer_testimonials.headline': 'Euer Feedback macht uns besser',


            'email.from': 'E-Mail von:',
            'email.subject': 'Thema:',
            'email.participants': 'Anzahl der Teilnehmer:',
            'email.duration': 'Dauer des Coachings:',
            'email.experience_level': 'Erfahrungslevel:',
            'email.date': 'Wunschtermin(e) oder Zeitraum:',
            'email.place': 'Ort des Traings:',
            'email.code': 'Teilnahmecode:',
            'email.gift': 'Als Geschenk:',
            'email.gift_yes': 'Ja',
            'email.gift_no': 'Nein',


            'email.thank_you_for_upload': 'Danke, dass du dein Foto für den Workshop :title hochgeladen hast!',

            'email.greeting': 'Hallo',
            'email.new_workshop_assigned': 'Es wurde ein neuer Workshop in der Canon Academy angelegt, dem du als Trainer zugewiesen bist.',
            'email.direct_link_to_workshop': 'Hier geht es direkt zum Workshop:',
            'email.browser_link': 'Falls der Link nicht klickbar sein sollte, rufe die folgende Adresse in deinem Browser auf:',
            'email.best_regards': 'Dein Canon Academy Team',



            'email.password_expiry_notice': 'Ihr Passwort wurde zuletzt vor 3 Monaten geändert und',
            'email.days_until_expiry': 'läuft in :days Tagen ab.|läuft in :day Tag ab.',
            'email.password_change_prompt': 'Bitte melden Sie sich in der Canon Academy an um Ihr Passwort zu ändern, bevor es ungültig wird.',
            'email.change_password_button': 'Jetzt Passwort ändern',
            'email.best_regards_Ihr': 'Ihr Canon Academy Team',


            'email.no_materials_uploaded': 'du hast noch keine Unterlagen für den Workshop',
            'email.workshop_on_date': 'am :date zum Download bereitgestellt.',
            'email.upload_materials_prompt': 'Bitte lade rechtzeitig Unterlagen für deine Teilnehmer hoch. Über den folgenden Link gelangst du direkt zum Upload Bereich:',


            'email.webinar_start_notification': 'dein Webinar',
            'email.webinar_start_date': 'startet am :date. Anbei senden wir dir das zugehörige Webinar PDF.',
            
            
            'email.workshop_start_notification': 'dein Workshop',
            'email.workshop_start_date': 'startet am :date. Anbei senden wir dir das zugehörige Workshop PDF.',
            

            'email.workshop_returned': 'Der Workshop',
            'email.workshop_correction': 'wurde dir zur Korrektur zurück übergeben.',
            'email.correction_points': 'Die folgenden Punkte müssen angepasst werden:',


            'email.starts_on': 'startet am',
            'email.workshop.attachment': 'Anbei senden wir dir das zugehörige Workshop PDF.',
            
                
            'error.503.title': 'Gleich wieder da | Canon Academy',
            'error.503.message': 'Wir bereiten gerade neue Funktionen für dich vor. Schaue in einer Minute noch einmal vorbei.',


            'meta.application_name': 'Application Name',
            

            'knowhow.mainheadline_expert': 'Werde zum Experten - Canon Academy Know-How',
            'tipps_tricks.description': 'Inspiration für die Praxis: Jede Woche präsentiert die Academy neue praktische Tipps, erklärt aktuelle Technologien und stellt besondere Features von Canon Produkten vor.',
            'tipps_tricks.link': 'Zu den Tipps & Tricks',
            'leitfaden.title': 'Leitfäden',
            'leitfaden.description': 'Wissen auf den Punkt gebracht: Die kostenlosen Academy Leitfäden vermitteln kompakt, anschaulich und praxisnah einen inspirierenden Einstieg zu verschiedenen Themen- und Produktwelten.',
            'leitfaden.link': 'Zu den Leitfäden',
            'hacks.description': 'In den Academy Hacks geben Trainer, Canon Ambassadore und Produktspezialisten Tipps zu Canon Kameras, Objektiven und Zubehör. Die Hacks zeigen dir anschaulich, wie du mit Canon in der Praxis bessere Ergebnisse erzielst.',
            'hacks.link': 'Zu den Hacks',
            'talks.description': 'Die Talks mit unseren Experten präsentieren auf unterhaltsame Art aktuelle Themen und Produktneuheiten.',
            'talks.link': 'Zu den Talks',
            'podcast.title': 'Der Foto- und Video-Podcast',
            'podcast.description': 'Die Canon Academy Trainer Olaf Franke und Mustafa Morad präsentieren gemeinsam den Audio-Podcast der Canon Academy mit unterhaltsamen Interviews und spannenden Praxis-Informationen zu Fotografie- und Videothemen.',
            'podcast.link': 'Zum Podcast',
            'gallery.image1.alt': 'Food - Canon Academy Tipps & Tricks',
            'gallery.image2.alt': 'Firmware Update - Canon Academy Tipps & Tricks',
            'gallery.image3.alt': 'EOS EF/RF Objektive - Canon Academy Leitfäden',
            'gallery.image4.alt': 'Ambient Arranmore Ireland - Canon Academy Leitfäden',
            'gallery.image5.alt': 'Portrait - Canon Academy Hacks',
            'gallery.image6.alt': 'Filmen - Canon Academy Hacks',
            'gallery.image7.alt': 'Talk-Runde - Canon Academy Talks',
            'gallery.image8.alt': 'Canon Academy Talks',
            'gallery.image9.alt': 'Extrem Shooting am Vulkan',
            'gallery.image10.alt': 'Olaf Franke und Mustafa Morad im Portrait',


            'filesize': 'Dateigröße',
            

            'tag_filter.title': 'Weniger suchen, mehr finden',
            'tag_filter.subtitle': 'Ich habe Lust auf...',
            'tag_filter.all': 'Alle',
            'tag_filter.basics': 'Grundlagen',
            'tag_filter.portrait': 'Portrait',
            'tag_filter.landscape_travel': 'Landschaft & Reise',
            'tag_filter.architecture': 'Architektur',
            'tag_filter.nature_macro': 'Natur-, Tier- und Makro',
            'tag_filter.sport': 'Sport',
            'tag_filter.ettl_flash': 'E-TLL Blitzen',
            'tag_filter.special_topics': 'Spezialthemen',
            'tag_filter.master_class': 'Master Class',
            'tag_filter.food': 'Food',
            'tag_filter.photobook': 'Fotobuch',
            'tag_filter.filter_by': 'Filtern nach...',
            'tag_filter.level': 'Erfahrungslevel',
            'tag_filter.author': 'Autor',
            'tag_filter.products': 'Produkte',
            'tag_filter.misc': 'Sonstiges',



            'form.terms.agreement_1': 'Ich bin damit einverstanden, dass die von mir eingegebenen Angaben für die Beantwortung meiner Kontaktaufnahme verwendet werden und habe die',
            'form.terms.agreement_2':'Datenschutzbestimmungen in unseren Teilnahmebedingungen',
            'form.terms.agreement_3': 'zur Kenntnis genommen.',


            'contact_form.placeholder.name': 'Dein Name *',
            'contact_form.placeholder.email': 'Deine E-Mail-Adresse *',
            '': 'opt. Workshop-ID',
            'contact.is_there_anything_else.message': 'Gibt es noch etwas, das du uns mitteilen möchtest? Welches Equipment soll verwendet werden etc.?',

            'cookiebar.message_1': 'Wir verwenden Cookies, um dir das bestmögliche Erlebnis in deinem Umgang mit Canon und unserer Website zu bieten. Erfahre mehr über unsere Verwendung von Cookies und ändere deine Cookie-Einstellungen',
            'cookiebar.message_2': 'hier',
            'cookiebar.message_3': 'Du stimmst unserer Verwendung von Cookies auf deinem Gerät zu, indem du weiterhin unsere Webseite verwendest, oder per Klick auf Annehmen.',
            'cookiebar.close': 'schliessen',
                

            'event.online_workshop': 'Der Workshop wird online durchgeführt',
            'event.webinar_online': 'Das Webinar wird online durchgeführt',
            'event.webinar_recording': 'Webinar-Aufzeichnung',
            'event.min_slots': 'mindestens :min_slots Teilnehmer',


            'raffle.preview_message': 'Preview - öffentlich',
            'raffle.daily_winner_heading': 'Der heutige Tagesgewinn geht an',
            'raffle.congratulations_message': 'Herzlichen Glückwunsch!',
            'raffle.missed_prize_message': 'Leider hast du diesen Tagesgewinn verpasst.<br><br> Eine Teilnahme ist nicht mehr möglich.',
            'raffle.new_chance_message': 'Neue Chance, neues Glück',
            'raffle.calendar_terms': 'An jedem Tag, an dem du am Canon Academy Adventskalender Gewinnspiel teilnimmst, hast du die Chance auf den jeweiligen Tagesgewinn. Und wenn du mit deiner Antwort auf unsere Frage richtig liegst, hast du sogar die Chance auf unseren großen Hauptgewinn.',
            'raffle.participation_already': 'Du nimmst bereits am Gewinnspiel teil!',
            'raffle.correct_answer_congrats': 'Herzlichen Glückwunsch, deine Antwort ist korrekt<br><br> Du nimmst damit nicht nur an der Verlosung für den heutigen Tagesgewinn teil, sondern auch am Hauptgewinn des Canon Academy Adventskalenders.',
            'raffle.wrong_answer_message': 'Schade, deine Antwort ist leider nicht korrekt.<br><br> Du hast damit leider keine Chance auf den Hauptgewinn des Canon Academy Adventskalenders, nimmst aber an der Verlosung für den heutigen Tagesgewinn teil.',
            'raffle.good_luck_message': 'Die Canon Academy wünscht dir viel Glück!',
            'raffle.form_heading': 'Jetzt Formular ausfüllen und teilnehmen!',
            'raffle.privacy_policy_link': 'Datenschutzrichtlinien',
            'raffle.accept_terms_1': 'Mit der Registrierung wird den',
            'raffle.accept_terms_2': 'Teilnahmebedingungen',
            'raffle.accept_terms_3': 'zugestimmt',
            'raffle.accept_terms_4': 'Es gelten die folgenden',
            'raffle.newsletter_checkbox_label': 'Newsletter abonnieren',
            'raffle.submit_button': 'Formular absenden',


            'controller.starrating.title': 'Gesamteindruck',
            // @todo
            'controller.starrating.desc': 'verbesserungsw&uuml;rdig sehr gut',
            'controller.starrating.good': 'sehr gut',
            'starrating.form.placeholder_name': 'Vor- und Nachname',


            'controller.teaser.title': 'Wir teilen unser Know-How!',
            'controller.teaser.description': 'Am Ende zählt das gute Bild, aber auf dem Weg dorthin spielt die Technik eine wichtige Rolle. Die Canon Academy hilft dir mit den Academy-Leitfäden, den Hacks und Tipps & Tricks dabei, dein Wissen auch von zu Hause aus zu erweitern. Die Wahl des richtigen Objektivs oder Blenden- und Belichtungseinstellung wird für dich dadurch beherrschbar.',
            'controller.teaser.workshop_1.title': 'Langzeitbelichtung / Nachtfotografie',
            'controller.teaser.workshop_1.description': 'Weit hinten, hinter den Wortbergen, fern der Länder Vokalien und Konsonantien leben die Blindtexte. Abgeschieden wohnen sie in Buchstabhausen an der K',
            'controller.teaser.workshop_2.title': 'Naturfotografie',
            'controller.teaser.workshop_2.description': 'Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und',
            'controller.teaser.workshop_3.title': 'Beauty Mode & Laufsteg',
            'controller.teaser.workshop_3.description': 'Es gibt im Moment in diese Mannschaft, oh, einige Spieler vergessen ihnen Profi was sie sind. Ich lese nicht sehr viele Zeitungen, aber ich habe gehör',
            'controller.teaser.workshop_4.title': 'Konzertfotografie',
            'controller.teaser.workshop_4.description': 'Zwei flinke Boxer jagen die quirlige Eva und ihren Mops durch Sylt. Franz jagt im komplett verwahrlosten Taxi quer durch Bayern. Zwölf Boxkämpfer jage',


            'btn.show_more_themes': 'mehr themen anzeigen',
            'themes': 'Themenwelten',


            'mod-portrait-ffp.portrait': 'Magische Portraits',
            'mod-portrait-ffp.nature': 'Naturfotografie',
            'mod-portrait-ffp.packshots': 'Packshots',
            'mod-portrait-ffp.wildlife': 'Wilde Tiere',
            'mod-portrait-ffp.category_1': 'Kategorie',


            'trainer_list.profile_button': 'Zum Profil',


            'testimonial.overlaylink': 'Zur Trainer Detailseite',



            'category.heading_1': 'Intuition is important. Never let your guard down by thinking you’re good enough. Remember it’s called the creative process, it’s not the creative moment.',
            'category.workshop_finder_heading': 'Workshops-Finder',
            'category.workshop_finder_btn': 'Workshop finden',
            'category.coachings_heading': 'Coachings',
            'category.coachings_btn': 'Coachings anfragen',
            'category.heading_2': 'Etwas Text über die Workshops in Deutschland mit den tollen Trainern,',
            'category.paragraph_1': 'der den Nutzern Lust macht sich einen Workshop auszusuchen! Etwas Text über die Workshops in Deutschland mit den tollen Trainern, der den Nutzern Lust macht sich einen Workshop auszusuchen!',


            'mod_vita.coaching_request_button': 'individualcoaching anfragen',
            'mod_vita.canon_story_heading': 'Meine Canon Story',


            'workshop_search.event_code_button': 'Event-Code',
            'workshop_search.label': 'Event-Code hier eingeben',
            'workshop_search.submit_button': 'Event finden',
            'workshop_search.no_code_text_1': 'Noch keinen Event-Code? Jetzt',
            'workshop_search.no_code_text_2':'für einen Workshop entscheiden',
            'workshop_search.no_code_text_3':'und Zugang zu exklusiven Inhalten und Bewertungen erhalten.',


            'workshop_view.calendar_view': 'Kalenderansicht',
            'workshop_view.list_view': 'Listenansicht',



            'canon_voucher': 'Canon Academy Gutschein:',
            'not_redeemable': 'NICHT EINLÖSBAR',
            'redeemable': 'EINLÖSBAR',
            'price_incl_vat': 'inkl. MwSt.',


            'workshop_detail.trainer': 'Trainer',
            'workshop_detail.event_location': 'Veranstaltungsort',
            'workshop_detail.online_workshop': 'Der Workshop wird online durchgeführt',

            'at_least': 'mindestens',
            'participants': 'Teilnehmer',
            'workshop_detail.partners': 'Partner',


            'lecture.preview.back_to_edit': 'Zurück zum Bearbeiten',
            'trainertestimonials.headline': 'Das sagen unsere Teilnehmer',


            'lenssimulator.topic_tile.alt_1': 'Heißluftballons - Canon Academy Grundlagen',
            'lenssimulator.topic_tile.alt_2': 'Hiking - Canon Academy Landschaft und Reise',


            'lenssimulator.workshop_tile.alt_1': 'Soul Pictures - Canon Academy Portraitfotografie',
            'lenssimulator.workshop_tile.alt_2': 'Backen mit Beeren - Canon Academy Foodfotografie',
            'lenssimulator.workshop_tile.alt_3': 'Auto und Action - Canon Academy Sportfotografie',


            'lenssimulator.workshop_tile.alt_4': 'Sascha Hüttenhain - Canon Academy Fotografie Portraitfotografie',
            'lenssimulator.workshop_tile.alt_5': 'After Work - Canon Academy Fotografie bei Nacht',
            'lenssimulator.workshop_tile.alt_6': 'Kaffee - Canon Academy Foodfotografie',


            'heroimage.alt': 'Canon Linsensimulator online - Online Objektive testen',
            'lenssimulator.heading_1': 'Jedes Objektiv verändert deinen Blick auf die Welt',
            'lenssimulator.intro_text': 'Mit jedem Objektiv für deine EOS öffnest du die Tür zu neuen Motivwelten und erweiterst deinen kreativen Spielraum. Erfahre, welche Objektive sich am besten eignen, um deine Ideen umzusetzen und Geschichten festzuhalten. Fokussiere auf das Wesentliche und lasse den Hintergrund in der Unschärfe verschwinden.',
            'lenssimulator.link_image.alt': 'Canon Lens Simulator',
            'lenssimulator.start_button': 'Objektiv-Simulator',
            'lenssimulator.start_button_subtext': 'starten',
            'lenssimulator.description_text': 'Mit dem Canon Objektiv-Simulator findest du ganz intuitiv Objektive, die zu deiner Kamera und zu deinen Motiven passen. Probiere aus, wie sich der Bildausschnitt mit der Brennweite von Weitwinkel bis Tele ändert. Spiele mit der Schärfentiefe, indem du den Blendenregler bewegst. Objektive, die zu deiner Auswahl passen, werden automatisch angezeigt.',
            'lenssimulator.heading_2': 'Objektiv: Input von unseren Experten',
            'lenssimulator.image.alt': 'Canon Objektiv-Simulator',
            'lenssimulator.textblock_1': 'Zum Fotografieren und Filmen mit deiner EOS Kamera kannst du aus mehr als 80 Canon Objektiven auswählen. In den',
            'lenssimulator.link_workshop.title': 'Canon Fotoworkshops',
            'lenssimulator.textblock_2': 'der Canon Academy probierst du neue Objektive einfach aus – die Trainer haben immer aktuelle Objektive oder Neuheiten dabei. Stöbere auf der Academy Homepage nach „objektivem“ Input: In den',
            'lenssimulator.link_academy_hacks.title': 'Academy Hacks',
            'lenssimulator.link_talks.title': 'Academy Talks',
            'lenssimulator.link_webinars.title': 'Academy Webinaren',
            'lenssimulator.link_webinars.text': 'Webinaren',
            'lenssimulator.heading_3': 'In jedem Leitfaden steckt ein Objektiv',
            'lenssimulator.link_guides.title': 'Die Leitfäden der Canon Academy',
            'lenssimulator.textblock_3': 'haben unterschiedliche Schwerpunkte – Objektive sind immer ein Thema. Erweitere mit den Leitfäden Schritt für Schritt dein Know-how und erfahre, welche Objektive unsere Experten z. B. für Portrait-, Makro- oder Sportfotografie empfehlen. Du kannst die Leitfäden als PDF-Dateien kostenlos herunterladen.',
            'lenssimulator.heading_4': 'Am besten testen – in unseren Workshops',
            'lenssimulator.test_objective_in_live': 'Teste Canon Objektive live in unseren',
            'lenssimulator.link_workshop_page.title': 'Canon Academy Workshops',
            'workshops': 'Workshops',
            'lenssimulator.textblock_5': 'und erhalte',
            'lenssimulator.link_cashback.title': 'Canon Academy Cashback',
            'lenssimulator.link_cashback.text': 'bis zu 70€ Academy Cashback',
            'lenssimulator.textblock_6': 'beim Kauf eines Canon Produktes. Unsere Workshops werden von erfahrenen Trainern durchgeführt, die zudem über ein umfangreiches Canon Equipment zum Testen verfügen. Lass dich inspirieren und experimentiere mit deiner Kamera. Im Workshopkalender findest du unsere Fotokurse, die dir dabei helfen, den nächsten Schritt zu machen.',
            'lenssimulator.footer_note': '* gilt nur Workshops bei denen Canon Academy Veranstalter ist. Weitere Informationen und Teilnahmebedingungen',
            'lenssimulator.fullwidth_image_1.alt': 'Canon Academy EOS SYSTEM MIRRORLESS UND DSLR - Technik Praxis, Objektive und Zubehoer',
            'lenssimulator.fullwidth_image_2.alt': 'Canon Academy my Lens Love - Finde dein Objektiv für deine Story',


            'workshop.types.workshop.description': 'Kleine Gruppen, erfahrene Trainer und spannende Locations bieten dir ein inspirierendes Live-Erlebnis. In den Workshops der Canon Academy findest du eine perfekte Mischung aus Theorie und  Praxis. Dabei steht dir umfangreiches Equipment zum Testen und Experimentieren zur Verfügung.',
            'to_the': 'Zu den',
            'workshop.types.online_workshop.description': 'In zwei Sessions vermitteln unsere Trainer Grundlagen und Praxiswissen.  Zwischen den beiden Sessions erhaltet ihr Aufgaben zum praktischen Testen. Wenn du dich zu Hause am Computer weiterbilden möchten, bieten dir unsere Online-Workshops eine perfekte Plattform.',
            'workshop.types.webinar.description': 'Wissen, Unterhaltung und Inspiration in kompakter Form: Webinare sind der Shooting-Star bei den Academy Online-Formaten. Unsere Experten und ihre Gäste servieren dir fundierte Informationen aus der Fotowelt mit Canon.',
            'workshop.types.lecture.description': 'Erlebe Canon Academy Trainer, Experten und Canon Amabassadore live auf der Bühne. Melde dich für Vorträge an, die wir z. B. bei unseren Partnern im Handel oder bei Foto-Events organisieren.',
            'controller.coaching.description': 'Das Programm für Individualisten. Mit einem Coaching bekommst du solo oder in der Gruppe eine exklusive Live- oder Online-Session mit unseren Trainern zu einem Thema deiner Wahl.',
            'controller.coaching.link': 'Zum',
            'workshop.types.travel.description': 'Mehr erleben mit der Canon Academy – dafür stehen unsere Fotoreisen, die wir mit Trainern und Partnern für dich organisieren. Reise mit uns zu faszinierenden Orten und erlebe Landschaft, Natur und Menschen.',


            'workshop.image_1.alt': 'Seitenansicht eines Fotografes bei der Arbeit vor einer Skater Anlage',
            'workshop.image_2.alt': 'Canon Kameras und Objektive auf einem Rucksack auf einer Wiese am Berghang',
            'workshop.image_3.alt': 'Fotograf fotografiert in der Stadt bei low light',
            'workshop.image_4.alt': 'Nicolai Deutsch erklärt die Funktionen einer Canon Kamera',
            'workshop.image_5.alt': 'Petra Selbertinger beim Vorstellen von Canon Kameras und Zubehör',
            'workshop.image_6.alt': 'Ein schwarzer Canon Drucker druckt Fotos in hoher Qualität',
            'workshop.image_7.alt': 'Canon EOS R als Makro Aufnahme',
            'workshop.image_8.alt': 'Mann erklärt vor der Kamera etwas ausführlich mit Gestik.',
            'workshop.image_9.alt': 'Zwei Fotografinnen schauen lächelnd auf das Display einer Canon Kamera',
            'workshop.image_10.alt': 'Zwei Personen klettern gesichert einen Felsen hinauf',
            'workshop.image_11.alt': 'Zwei Touristen sitzen in einer Bar und schauen auf das Smartphone',
            'workshop.image_12.alt': 'Fotograph schaut am Strand bei Sonnenuntergang auf Canon Kamera Display',


            'program.heading': 'Fotografie erleben mit der Canon Academy',
            'program.description': 'Jeder Bildermacher hat einen individuellen Blick auf die Welt. Bei uns findest du Foto- und Videothemen, die dich inspirieren – in Formaten, die zu dir passen. Plane deinen nächsten Schritt mit der Canon Academy.',
            'workshop_finder.title_offwes': 'Finde Angebote, die zu dir passen.',
            'workshop_finder.text': 'Wähle eines oder mehrere Kriterien aus und lasse dir passende Angebote anzeigen.',
            'heroimage.alt_video': 'Canon Academy Header Video',
            'heroimage.alt_image': 'Canon Academy Header Image',


            'heroimage.alt_eos': 'Canon EOS R',
            'lecture.heading': 'Canon Academy Vorträge',
            'workshop_finder.title_lectures': 'Finde spannende Vorträge',


            'heroimage.alt_camera': 'Fotograf bei Dämmerung mit Canon Kamera',
            'online_workshop.heading': 'Hol die Experten online zu dir nach Hause',
            'online_workshop.description_1': 'Entdecke die Online-Workshops der Canon Academy: Wir bieten dir ein breites Spektrum an Foto- und Videokursen, mit denen du dein Know-how flexibel und bequem von zu Hause aus vertiefen und erweitern kannst. Nutze die Möglichkeit, dich über unsere professionelle Workshop-Plattform intensiv mit Trainern und Experten zu deinen Themen auszutauschen. Erlebe inspirierende Online-Sessions mit anderen Foto- und Videobegeisterten.',
            'online_workshop.description_2': 'Unsere Trainerinnen und Trainer sind erfahrene Canon Experten und leidenschaftliche Fotografen und Filmemacher mit langjähriger Erfahrung. Sie bringen fundiertes technisches Wissen mit und erweitern deine kreative Perspektive. Je nach Workshop-Thema liegt der Fokus auf technischen Aspekten oder der Ausrüstung für Fotografie, Video und Fotodruck oder auf Design und Storytelling.',
            'online_workshop.description_3': 'Natürlich kannst du unsere Online- und Vor-Ort-Workshops flexibel miteinander kombinieren: Bring dein technisches Know-how in einem Online-Workshop auf den neuesten Stand und starte anschließend im Themenworkshop vor Ort durch.  Mit der Canon Academy gestaltest du dein Lernerlebnis individuell und nachhaltig - so wie es am besten zu deinem Wissensstand, deinen Themen und deinem Terminkalender passt.',
            'online_workshop.description_4': 'Vertiefe dein Wissen mit den Online-Workshops der Canon Academy!',
            'workshop_finder.title_online': 'Finde deinen Online Workshop',


            'heroimage.alt_panorama': 'Strandpanorama',
            'travel.heading': 'Mit Gleichgesinnten neue Erfahrungen sammeln',
            'workshop_finder.title_photoshoot': 'Finde unvergessliche Fotoreisen',


            'workshop_finder.title_webinars': 'Finde Webinare, die zu dir passen.',


            'workshop.heading': 'Mit Spaß und Leidenschaft deine Fähigkeiten entwickeln',
            'workshop.description_1': 'Bei der Canon Academy findest du als Einsteiger, Fortgeschrittener oder Profi inspirierende Foto- und Videokurse, die zu deinen kreativen Themen und deinen Ansprüchen an Technik und Gestaltung passen.',
            'workshop.description_2': 'Wir wollen dich in unseren Workshops von der ersten bis zur letzten Minute begeistern. Die Basis dafür bildet unser motiviertes und kompetentes Trainerteam. Mit anschaulich vermittelter Theorie, spannenden Praxiseinheiten und inspirierenden Motiven fordern und fördern unsere Workshops deine technischen und kreativen Fähigkeiten. Kleine Workshop-Gruppen sorgen für ein intensives Gemeinschaftserlebnis. Sorgfältig ausgewählte Locations bilden den Rahmen für einen inspirierenden Austausch.',
            'workshop.description_3': 'Bei allen Workshops stehen Canon Kameras, Objektive und Zubehör zum Testen und Ausprobieren zur Verfügung.',
            'workshop.description_4': 'Mit der Canon Academy kannst du dein Lernerlebnis individuell gestalten. Starte zum Beispiel mit einem Online-Workshop zu den Grundlagen und suche dir einen passenden Live-Workshop vor Ort aus. So kannst du dein Wissen an einem spannenden Ort praktisch anwenden. Tipp: Für individuelle Betreuung und spezielle Themen schau dir auch unser Coaching-Angebot an.',
            'workshop.description_5': 'Entdecke jetzt die Workshops der Canon Academy!',
            'workshop_finder.title_workshop': 'Finde deinen Workshop',


            'email.confirmation.success': 'Vielen Dank. Du hast erfolgreich deine E-Mail bestätigt.',
            'email.confirmation.link_expired': 'Dieser Bestätigungslink ist leider abgelaufen und nicht mehr gültig. Du kannst einen neuen Link für diese E-Mail Adresse anfordern, indem Du dich erneut für ein Gewinnspiel anmeldest.',
            'email.confirmation.link_invalid': 'Dieser Link ist ungültig.',
            'email.confirmation.error': 'Es ist ein Fehler aufgetreten. Bitte wende dich an einen Administrator.',


            'social_media_share.title': 'Hat dir das Talk Topic gefallen?',
            'social_media_share.message': 'Wir hoffen, dir mit diesem Talk Topic weitergeholfen zu haben und freuen uns über deine spannenden Ergebnisse unter dem Hastag #CanonAcademy!',
            'social_media_share.share_prompt': 'Jetzt das Talk Topic teilen!',
            'social_media_share.instagram_hashtag': '#CanonAcademy',
            'social_media_share.instagram_title': 'CanonAcademy on Instagram',

            'matching_offers': 'Passende Angebote',


            'cookie_info.title': 'Cookie-Informationen',
            'cookie_info.what_is_cookie': 'Was ist ein Cookie?',
            'cookie_info.intro_1': 'Cookies sind kleine Textdateien, die beim Besuch bestimmter Webseiten auf Ihrem Computer gespeichert werden. Auf',
            'cookie_info.intro_2':'verwenden wir Cookies, um Ihre Interessen zu erfahren und Sie als wiederkehrenden Besucher unserer Seite zu identifizieren. Die folgende Tabelle enthält eine Liste der Cookies, die beim Besuch von',
            'cookie_info.intro_3': 'möglicherweise auf Ihrem Computer gespeichert werden',
            'cookie_info.intro_4': 'Die von uns verwendeten Cookies sind keinesfalls schädlich für Ihren Computer. In den von Canon verwendeten Cookies werden keine personenbezogenen Daten wie z. B. Kreditkartendetails gespeichert. Wir verwenden jedoch mithilfe von Cookies ermittelte verschlüsselte Informationen, um unsere Webseite besser an Ihre Bedürfnisse anpassen zu können. Diese Informationen helfen uns beispielsweise bei der Ermittlung und Behebung von Fehlern oder dabei, Ihnen beim Besuch unserer Seite relevante Produkte anzuzeigen.',
            'cookie_info.intro_5': 'Damit Sie die Inhalte und personalisierten Funktionen auf',
            'cookie_info.intro_6': 'in vollem Umfang nutzen können, muss Ihr Computer, Tablet oder Smartphone Cookies akzeptieren (das entspricht meist der Standardeinstellung), da wir bestimmte personalisierte Funktionen nur mithilfe von Cookies bereitstellen können.',
            'cookie_info.change_settings': 'Änderung Ihrer Cookie-Einstellungen oder ablehnen',
            'cookie_info.settings_info_1': 'In unseren Cookies werden keine sensiblen Informationen wie Namen, Adressen oder Zahlungsdetails gespeichert. Wenn Sie Cookies auf',
            'cookie_info.settings_info_2': 'oder anderen Webseiten jedoch einschränken, blockieren oder löschen möchten, können Sie in Ihrem Browser die entsprechende Einstellung vornehmen. Da sich diese Einstellung je nach Browser unterscheidet, lesen Sie im Hilfemenü des Browsers oder im Benutzerhandbuch des Mobilgeräts nach, wie die Cookie-Einstellungen geändert werden.',
            'cookie_info.laravel_cookies': 'Diese Laravel Cookies verwenden wir auf der Canon Academy',
            'cookie_info.google_analytics_intro': 'Google Analytics ist ein Webanalysedienst von Google Inc. und setzt Cookies, die uns ermöglichen, die Nutzung unserer Website auszuwerten. Es handelt sich um einen im Web weit verbreiteten Dienst, bei dem alle Daten anonymisiert werden – die Cookies speichern keine persönlich identifizierbaren Informationen. Diese Cookies helfen uns, das Besucherverhalten besser zu verstehen und erlauben uns eine Verbesserung des Angebots, um unsere Benutzer-Erfahrung zu steigern. Es ist eine Win-Win Beziehung.',
            'cookie_info.analytics_purposes': 'Wir könnten für folgende Zwecke Google Analytics verwenden:',
            'cookie_info.analytics_purpose_1_de_de': 'Remarketing (zeigt unsere Anzeigen auf den Websites Dritter). Canon und Drittanbieter (einschließlich Google) verwenden Cookies, um zu informieren, zu optimieren und Anzeigen bereitzustellen, die auf einem früheren Besuch unserer Website basieren.',
            'cookie_info.analytics_purpose_1_de_ch': 'Remarketing (zeigt unsere Anzeigen auf den Websites Dritter). Canon und Drittanbieter (einschliesslich Google) verwenden Cookies, um zu informieren, zu optimieren und Anzeigen bereitzustellen, die auf einem früheren Besuch unserer Website basieren.',
            'cookie_info.analytics_purpose_2': 'Bericht über Google Display Network Impressions. Canon und Drittanbieter verwenden Cookies, um zu berichten, wie unsere AdImpressions, andere Verwendungen von Ad-Diensten und Wechselwirkungen mit diesen Ad Impressions und Ad-Diensten mit dem Besuch auf unserer Website in Zusammenhang stehen.',
            'cookie_info.analytics_purpose_3': 'Bericht über demografische Merkmale und Interessen. Canon verwendet Daten aus der Google-Interest-basierten Werbung oder Nutzern von Drittanbietern (wie das Alter, Geschlecht und die Interessen) mit Google Analytics, um unsere Marketingstrategie zu verbessern.',


            'cookie_info.analytics_opt_out': 'Die Besucher können über entsprechende Einstellungen über eine Teilnahme an Google Analytics entscheiden und die Google Display-Netzwerk-Anzeigen auf den Seiten für Googles Anzeigeneinstellungen anpassen.',
            'cookie_info.analytics_opt_out_extension_1': 'Besucher können die Teilnahme an Google Analytics mit dieser',
            'cookie_info.analytics_opt_out_extension_2': 'Browser Erweiterung',
            'cookie_info.analytics_opt_out_extension_3': 'beenden.',
            'cookie_info.tealium_intro': 'Tealium',
            'cookie_info.tealium_info': 'TealiumiQ ist ein Tag-Management-System, welches Canon Academy verwendet, um Technologien übergreifend für alle seine Webseiten zu verwalten, wie Analytics-Werkzeuge, Umfrage-Werkzeuge, Marketing, Testing & Targeting-Werkzeuge.',
            'cookie_info.tealium_audience_stream': 'Tealium AudienceStream ist ein kundenorientiertes Segmentierungs- und Aktionswerkzeug. Wir nehmen die Aktionen auf, die Kunden bei einem Website-Besuch ausführen, und erhalten somit ein besseres Verständnis von der Verwendung unserer Website. Wir nutzen diese Informationen, um Ihr Erlebnis durch personalisierte, relevante und gezielte Inhalte zu verbessern. Wir nutzen Tealium AudienceStream auf allen unseren Plattformen und mobilen Anwendungen. Dadurch können wir Ihr Verhalten plattformübergreifend sammeln, damit die Nutzererfahrung auf den Nutzer abgestimmt ist, unabhängig von der verwendeten Canon Plattform. Wir können Ihr Online-Erlebnis mit Canon bereits vor der Registrierung eines Online-Accounts bei uns personalisieren. Ihr personalisiertes Erlebnis mit der Website geht nicht verloren, wenn Sie erst später ein Online-Konto bei uns anlegen.',
            'cookie_info.tealium_cookies': 'Von uns verwendete Tealium Cookies',

            'cookie_info.tealium_cookie_utag_main_description_1': 'Das utag_main Cookie ist ein Cookie von Tealium, damit wir dessen Tag-Manager-Lösung einsetzen können.',
            'cookie_info.tealium_cookie_utag_main_description_2': 'Das utag_main Cookie ist ein Erstanbieter-Cookie von Tealium. Dieses Cookie nimmt einen Zeitstempel auf, sobald der Seitenbesuch beginnt, zählt die Anzahl der Aufrufe, die Anzahl aller Seitenbesuche und eine individuelle ID.',
            'cookie_info.tealium_cookie_utag_main_description_3': ' Diese Informationen werden von unseren Analytics-Werkzeugen zur Verbesserung der Daten zu Ihrem Website-Besuch verwendet. Somit verstehen wir besser, wie Nutzer die Seite verwenden und wie man das Nutzerlebnis verbessern kann.',
            'cookie_info.tealium_cookie_utag_main_expiration': '1 Jahr',
            'cookie_info.tealium_cookie_tealium_segments': 'tealium_segments',
            'cookie_info.tealium_cookie_tealium_segments_description_de_ch': 'Dieses Cookie speichert einen Wert, den wir Ihnen basierend auf Ihrer Aktivität auf der Website zuweisen. Zu dieser Aktivität zählen die aufgerufenen Seiten, wie häufig Sie die Seite aufrufen und bestimmte Aktionen, die Sie beim Aufrufen der Website ausführen. Wir ordnen Sie basierend auf dieser Aktivität nach bestimmten Nutzerkriterien ein. So können wir Ihre Nutzererfahrung auf unserer Seite personalisieren und so anpassen, dass sie relevanter und personalisiert für Sie ist und Sie so eine bessere Online-Erfahrung geniessen können.',
            'cookie_info.tealium_cookie_tealium_segments_description_de_de': 'Dieses Cookie speichert einen Wert, den wir Ihnen basierend auf Ihrer Aktivität auf der Website zuweisen. Zu dieser Aktivität zählen die aufgerufenen Seiten, wie häufig Sie die Seite aufrufen und bestimmte Aktionen, die Sie beim Aufrufen der Website ausführen. Wir ordnen Sie basierend auf dieser Aktivität nach bestimmten Nutzerkriterien ein. So können wir Ihre Nutzererfahrung auf unserer Seite personalisieren und so anpassen, dass sie relevanter und personalisiert für Sie ist und Sie so eine bessere Online-Erfahrung genießen können.',

            'cookie_info.share_tools': "Canon Academy 'share' tools",
            'cookie_info.share_tools_info_1': 'Wenn Sie Inhalte auf ',
            'cookie_info.share_tools_info_2': 'über soziale Netzwerke wie Facebook oder Twitter mit Freunden teilen, werden möglicherweise auch Cookies von diesen Webseiten gespeichert. Die Cookie-Einstellungen von Dritten werden von uns nicht kontrolliert. Wir empfehlen Ihnen daher, Informationen zur Verwendung von Cookies auf der jeweiligen Webseite einzuholen.',
            'cookie_info.third_party_links_1': 'Links von',
            'cookie_info.third_party_links_2': 'zu Webseiten von Dritten',
            'cookie_info.third_party_links_info_1': 'Canon ist nicht für Cookies auf Webseiten von Dritten verantwortlich, die auf',
            'cookie_info.third_party_links_info_2': 'verlinkt sind.',
            'cookie_info.third_party_cookies': 'Cookies von Dritten',
            'cookie_info.third_party_cookies_info_1': 'Wenn Sie eine Seite auf',
            'cookie_info.third_party_cookies_info_2': 'besuchen, die eingebettete Inhalte (z. B. von YouTube oder Maporama) enthält, werden möglicherweise auch Cookies von diesen Webseiten gespeichert. Die Cookie-Einstellungen von Dritten werden von uns nicht kontrolliert. Wir empfehlen Ihnen daher, Informationen zur Verwendung von Cookies auf der jeweiligen Webseite einzuholen.',
            'cookie_info.more_info': 'Weitere Informationen zu Cookies',
            'cookie_info.more_info_text_1': 'Weitere allgemeine Informationen zu Cookies und deren Verwaltung finden Sie auf',
            'cookie_info.more_info_text_2': 'Beachten Sie, dass wir nicht für die Inhalte externer Webseiten verantwortlich sind.',
            'cookie_info.laravel_cookie_1': 'XSRF-TOKEN',
            'cookie_info.laravel_cookie_2': 'laravel_session',
            'cookie_info.laravel_cookie_3': 'locale',
            'cookie_info.cookie_expiration': 'Ablauf (Zeitpunkt, zu dem der Cookie vom Gerät gelöscht wird)',


            'more_info': 'Mehr erfahren',

            'topic.show.title': 'Workshops zum Thema',
            'workshop.slider.this_may_interest_you': 'Das könnte Sie auch interessieren',

            'nav.webinar.toggleStatus': 'Webinar aktivieren',

            'webinar.partner_area.title': 'Canon Partner Bereich',
            'webinar.retailer_access_code.label': 'Zugansgcode eingeben',

            'workshop.slider.loading_text': 'Weitere Webinare und Workshops werden geladen',



            //  Alex

            'booking.footer.book_now': 'Jetzt buchen',
            'booking.footer.register_now': 'Jetzt anmelden',
            'booking.footer.free': 'Gratis',
            'booking.footer.canon_voucher_not_redeemable': ' X NICHT EINLÖSBAR',
            'booking.footer.canon_voucher_redeemable': 'EINLÖSBAR',
            'booking.footer.canon_voucher': 'Canon Gutschein:',



            'workshoplist.loading_text': 'Weitere Workshops werden geladen',




            'workshoplist.type_free': 'FREI',
            'workshoplist.type_sale': 'SALE',
            'workshoplist.webinar_details': 'Zu den Webinar Details',
            'workshoplist.workshop_details': 'Zu den Workshop Details',



            'workshop.filter.title': 'Workshops Filtern',
            'workshop.filter.all_trainers': 'Alle Trainer',
            'workshop.filter.all_organizers': 'Alle Veranstalter',
            'workshop.filter.reset': 'Felder zurücksetzen',
            'workshop.overall_count.single_webinar': 'Webinar',



            'webinar.filter.title': 'Webinare Filtern',
            'webinar.filter.option.live': 'Live Webinare',
            'webinar.filter.option.on_demand': 'On Demand Webinare',
            'webinar.no_webinars_found': 'Es konnten keine Webinare gefunden werden.',
            // @todo
            'pagination.previous': 'Zur&uuml;ck',



            'clock': 'Uhr',
            'workshop.item.part_of_event': 'Teil eines Events',

            'mod.like.helpful': 'Hilfreich?',
            'mod.like.user_found_helpful': 'User finden das hilfreich.',


            'mod.gallery.loading': 'Impressionen werden geladen',




            'event_list.no_events': 'Aktuell gibt es leider keine Events.',
            'event_list.single_event': 'Event',

            'no_topics': 'Aktuell gibt es leider keine Themen.',

            'tip_teaser.quick_tip_badge': 'Quick-Tipp',
            'tip_teaser.likes_single': 'findet',
            'tip_teaser.likes_plural': 'finden',


            'content.loading': 'Stories werden geladen',



            'storylist.story_slider.title': 'Weitere Stories',
            'storylist.loading_text': 'Weitere Stories werden geladen',





            'story_item.tile_type': 'Story',


            'story_item.view_story_button': 'Zur Story',
            'workshop_map.loading_error': 'Fehler beim laden der Map.',

            'button.loading': 'Angebote werden gesucht',
            'button.search': 'Angebote suchen',
            'button.show_results.singular': '1 Ergebnis anzeigen',
            'button.show_results.plural': 'Ergebnisse anzeigen',


            'allworkshops-tab': 'Alle Angebote',
            'online_workshop-tab': 'Online Workshops',
            'travel-tab': 'Reisen',



            'workshop-filters.label': 'Ich suche:',
            'workshop-filters.all_types': 'Alle Typen',
            'workshop-filters.all_authors': 'Alle Autoren',
            'results-button.searching_text': 'Tipps werden gesucht',
            'results-button.trigger_search_text': 'Tipps suchen',

                
            'results-button.single_result_text': 'Ergebnis',
            'results-button.result_text_with_count': 'Ergebnisse:',


            'mod-workshopfilter.total_tips_singular': 'Tipp',
            'mod-workshopfilter.total_tips_plural': 'Tipps',
            'mod-workshopfilter.no_tips_found': 'Keine passenden Tipps gefunden.',


            'workshop-filters.filter_podcast_episodes': 'Podcast-Folgen filtern nach:',


                'workshop': 'Workshop',
                'description.prefix': 'Beschreibung für',
                'workshop.show.discover_slider': 'Entdecken',
                'canon.workshop.types.travel': 'Reise',

                'organizer.blade_organizer': 'Veranstalter',

            'workshop.booking_btn.canon_workshop': 'Buchungsmöglichkeit',
            'workshop.booking_btn.partner_workshop': 'Zur Buchung',
            'workshop.google_maps': 'Google Maps',
            'workshop.slots.min': 'mindestens Teilnehmer',


            // Aleks


            // Tteo

            'eventlist.no_actions': 'Aktuell gibt es leider keine Aktionen.',
            'eventlist.total_singular': 'Aktion',
            'eventlist.total_plural': 'Aktionen',
            'loading.text_1': 'Aktionen werden geladen',
            'loading.text_2': 'Aktionen kommen sofort',
            'loading.text_3': 'Wir laden Aktionen für dich',
            'loading.text_4': 'Kleinen Moment',
            'loading.text_5': 'In wenigen Sekunden bereit',


            'extended_finder.image_alt.podcast': 'Canon Academy - Podcasts',
            'extended_finder.filter': 'Filter',
            'extended_finder.state_open': 'ausblenden',
            'extended_finder.state_closed': 'einblenden',
            'extended_finder.filter_text.podcast': 'Podcasts filtern',
            'extended_finder.toggle_filter': 'Filter einblenden',


            'extended_finder.image_alt': 'Canon Academy - Finde dein Angebot',
            'extended_finder.filter_text': 'Angebote filtern',




            'glossary.wordbank_component.heading': 'Glossarbegriffe zum Thema',
            'glossary.wordbank_component.show_more': 'Mehr anzeigen',
            'glossary.wordbank_component.show_less': 'Weniger anzeigen',
            'glossary.wordbank_component.glossary_link': 'Zum Glossar',


            'gallery.loading_text_2': 'Bilder sind unterwegs',
            'gallery.loading_text_3': 'Wir laden Bilder für dich',
            'gallery.loading_text_4': 'Bilder werden geladen',
            'gallery.loading_text_5': 'Bilder kommen sofort',
            'gallery.load_more_photos': 'Weitere Fotos laden',



            'mod-workshopfilter.no_results.title': 'Es tut uns Leid.',
            'mod-workshopfilter.no_results.message': 'Ihr Suchbegriff konnte nicht gefunden werden.',
            'mod-workshopfilter.no_results.suggestion': 'Haben Sie einen Vorschlag für das Glossar?',
            'mod-workshopfilter.no_results.contact': 'Dann schreiben Sie uns eine E-Mail an',
            'mod-workshopfilter.loading_text_1': 'Glossareinträge werden geladen',
            'mod-workshopfilter.loading_text_2': 'Glossareinträge kommen sofort',
            'mod-workshopfilter.loading_text_3': 'Passende Glossareinträge werden gesucht',
            'mod-workshopfilter.loading_text_4': 'Deine Glossareinträge sind gleich da',
            'mod-workshopfilter.loading_text_5': 'Wir suchen Glossareinträge für dich',



            'workshop.filters.interested_in': 'Ich interessiere mich für:',
            'workshop.filters.all_topics': 'Alle Themen',
            'workshop.filters.enter_keyword': 'Suchbegriff eingeben',
            'workshop.filters.suggestion_not_found': 'Begriff nicht vorhanden.',
            'workshop.filters.suggest_now': 'Jetzt vorschlagen?',
            'workshop.filters.remove_filters': 'Filter entfernen',
            'workshop.filters.searching_entries': 'Einträge werden gesucht',
            'workshop.filters.search_entries': 'Glossareinträge suchen',


            'results_button.searching': 'Glossareinträge werden gesucht',
            'results_button.single_result': '1 Ergebnisse anzeigen',
            'results_button.results_with_count': '$count Ergebnisse anzeigen',
            'results_button.no_results': 'Keine Ergebnisse',



            'finder.offer': 'Angebot',
            'finder.offers': 'Angebote',
            'workshop_finder.no_offers_found': 'Keine Angebote gefunden',
            'list': 'Liste',
            'view.calendar': 'Kalender',
            'view.map': 'Karte',
            'no_matching_offers': 'Keine passenden Angebote gefunden.',
            'pagination.next': 'Weiter',


            'podcast.results.no_matching_podcasts': 'Keine passenden Podcasts gefunden',
            'podcast.results.loading_text_1': 'Podcasts werden geladen',
            'podcast.results.loading_text_2': 'Podcasts kommen sofort',
            'podcast.results.loading_text_3': 'Passende Podcasts werden gesucht',
            'podcast.results.loading_text_4': 'Deine Podcasts sind glWir suchen Podcasts für dicheich da',
            'podcast.results.loading_text_5': 'Wir suchen Podcasts für dich',


            'trainer.inc.gallery.title': 'Trainer Galerie',

            'from': 'von',
            'equipment.product.shop_link_1': 'Zum Canon Shop',
            'equipment.deprecated.product.link_1': 'Mehr zum Produkt',


            'workshoplist.headline': 'Angebote mit :firstname :lastname',


            'content-title': 'Kundendaten ändern',
            'connect.title': 'Verbinden mit',
            'connect.bitbucket': 'Bitbucket',
            'connect.mysalesguide': 'Mysalesguide',

            'index_blade_content-title': 'Mein Konto',


            'content-user.index.overview': 'Übersicht',
            'content-user.edit.customer_data': 'Kundendaten',
            'content-user.admin_area': 'Admin-Bereich',
            'content-user.logout': 'Logout',



            'coupon': 'Gutschein',
            'workshop-detail.title': 'Freude schenken – Mit dem Canon Academy Gutschein',
            'workshop-detail.subtitle': 'Verschenke einen Workshop der Canon Academy.',
            'workshop-detail.description_1': 'Fashion oder Food? Portrait oder Makro? Architektur oder Landschaft? Available Light oder Blitzlicht? Mit der Canon Academy entscheidest du dich bei jedem Thema für ein inspirierendes Workshop-Erlebnis mit einem erfahrenen Profi-Trainer. Entdecke unter Workshops unsere aktuellen Angebote.',
            'workshop-detail.description_2': 'Kaufe jetzt einen Academy Gutschein im Wert von 50€ oder 100€ und verschenke ein besonderes Erlebnis.',
            'workshop-detail.description_3': 'Beim Klick auf den Button „Gutschein buchen“ wirst du zu unserem Buchungspartner eventbrite weitergeleitet. Nach dem Kauf erhältst Du von uns einen Gutschein im PDF-Format mit dem Code zum Ausdrucken.',
            'workshop-detail.how_to_redeem.title': 'Und so löst du den Gutschein ein:',
            'workshop-detail.how_to_redeem.step_1': 'Wähle unter Foto-Workshops einen Workshop deiner Wahl aus. Bitte beachte: Der Gutschein ist nur für Workshops gültig, bei denen die Canon Academy Veranstalter ist. Dies ist in der Workshop Übersicht besonders gekennzeichnet.',
            'workshop-detail.how_to_redeem.step_2': 'Klicke auf „Workshop buchen“, dann auf „Tickets“ und klicke oben rechts auf „Werbecode“. Gib nun deinen Gutscheincode ein. Automatisch werden bis zu 169 Euro von der Kursgebühr abgezogen. Bitte beachte, dass der Gutschein kann nur einmal verwendet werden kann.',
            'workshop-detail.disclaimer': '* Keine Barauszahlung möglich. Für den Workshop gelten die Teilnahmebedingungen der Canon Academy. Bitte beachte: Der Wert dieses Gutscheins darf nicht höher als die Workshop-Gebühr sein.',
            'workshop-detail.gift_certificate.description': 'Der Gutschein ist nur für Canon Academy Workshops gültig. Er kann nicht für Händler-Workshops eingelöst werden.',
            'workshop-detail.gift_certificate.button_text': 'Gutschein über Eventbrite Buchen',
            'newsletter': 'Newsletter',

            'on_site_or_online': 'Vor Ort oder Online',
            'on_site': 'Vor Ort',

            'workshop-filters.search_in': 'Ich suche in:',
            'days': 'Tage',
            'hours': 'Stunden',
            'minutes': 'Minuten',
            'seconds': 'Sekunden',

            'trick.found_helpful': 'das hilfreich',
            'watch_video': 'Video ansehen',
            'read_article': 'Artikel lesen',
        };
    }
});
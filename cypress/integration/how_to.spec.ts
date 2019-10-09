import FileData = Cypress.FileData

describe('[How To]', () => {
  const SKIP_TIMEOUT = { timeout: 300 }

  before(() => {
    return cy.deleteDocuments('v2_howtos', 'title', '==', 'Create a how-to test')
  })

  describe('[List how-tos]', () => {
    const howtoUrl = '/how-to/make-glasslike-beams'
    const coverFileRegex = /howto-beams-glass-0-3.jpg/
    beforeEach(() => {
      cy.visit('/how-to')
      cy.logout()
    })
    it('[By Everyone]', () => {

      cy.log('No tag is selected')
      cy.get('.data-cy__multi-value__label').should('not.exist')

      cy.log('The Create button is unavailable')
      cy.get('[data-cy=create]').should('not.exist')

      cy.log('More How-tos button is hidden')
      cy.get('[data-cy=more-how-tos]', SKIP_TIMEOUT).should('be.hidden')

      cy.log('All how-tos are shown')
      const totalHowtos = 7
      cy.get('[data-cy=card]').its('length').should('be.eq', totalHowtos)

      cy.log('How-to cards has basic info')
      cy.get(`[data-cy=card] > a[href="${howtoUrl}"]`, SKIP_TIMEOUT)
        .then(($card) => {
          expect($card).to.contain('Make glass-like beams')
          expect($card).to.contain('By howto_creator')
          expect($card.find('img')).to.have.attr('src').match(coverFileRegex)
        })


      cy.log(`Open how-to details when click on a how-to ${howtoUrl}`)
      cy.get(`[data-cy=card] > a[href="${howtoUrl}"]`, SKIP_TIMEOUT)
        .click()
      cy.url().should('include', howtoUrl)
    })

    it('[By Authenticated]', () => {
      cy.login('howto_reader@test.com', 'test1234')
      cy.log('Create button is available')
      cy.get('[data-cy=create]')
        .click()
        .url().should('include', '/how-to/create')
    })
  })

  describe('[Filter with Tag]', () => {
    beforeEach(() => {
      cy.visit('/how-to')
      cy.logout()
    })
    it('[By Everyone]', () => {

      cy.log('Select a tag')
      cy.get('[data-cy=tag-select]').click()
      cy.get('.data-cy__menu').contains('product').click()
      cy.get('.data-cy__multi-value__label').contains('product').should('be.exist')
      cy.get('[data-cy=card]').its('length').should('be.eq', 4)

      cy.log('Type and select a tag')
      cy.get('.data-cy__input').get('input').type('injec')
      cy.get('.data-cy__menu').contains('injection').click()
      cy.get('[data-cy=card]').its('length').should('be.eq', 1)

      cy.log('Remove a tag')
      cy.get('.data-cy__multi-value__label').contains('injection').parent().find('.data-cy__multi-value__remove').click()
      cy.get('.data-cy__multi-value__label').contains('injection').should('not.exist')
      cy.get('[data-cy=card]').its('length').should('be.eq', 4)

      cy.log('Remove all tags')
      cy.get('.data-cy__clear-indicator').click()
      cy.get('.data-cy__multi-value__label').should('not.exist')
      cy.get('[data-cy=card]').its('length').should('be.gte', 7)
    })
  })

  describe('[Read a How-to]', () => {
    const specificHowtoUrl = '/how-to/make-an-interlocking-brick'
    const coverFileRegex = /brick-12-1.jpg/

    describe('[By Everyone]', () => {
      it('[See all info]', () => {
        cy.visit(specificHowtoUrl)
        cy.logout()
        cy.log('Edit button is not available')
        cy.get('[data-cy=edit]').should('not.exist')

        cy.log('How-to has basic info')
        cy.get('[data-cy=how-to-basis]').then(($summary) => {
          expect($summary).to.contain('By howto_creator', 'Author')
          expect($summary).to.contain('Make an interlocking brick', 'Title')
          expect($summary).to.contain('show you how to make a brick using the injection machine', 'Description')
          expect($summary).to.contain('12 steps', 'No. of Steps')
          expect($summary).to.contain('3-4 weeks', 'Duration')
          expect($summary).to.contain('Hard', 'Difficulty')
          expect($summary).to.contain('product', 'Tag')
          expect($summary).to.contain('injection', 'Tag')
          expect($summary).to.contain('moul', 'Tag')
          expect($summary.find('img[alt="how-to cover"]')).to.have.attr('src').match(coverFileRegex)
        })

        cy.log('Attachments are opened in new tabs')
        cy.get(`a[href*="art%20final%201.skp"]`).should('have.attr', 'target', '_blank')
        cy.get(`a[href*="art%20final%202.skp"]`).should('have.attr', 'target', '_blank')

        cy.log('All steps are shown')
        cy.get('[data-cy=step]').should('have.length', 12)

        cy.log('All step info is shown')
        cy.get('[data-cy=step]:nth-child(12)').within(($step) => {
          const pic1Regex = /brick-12-1.jpg/
          const pic3Regex = /brick-12.jpg/
          expect($step).to.contain('12', 'Step #')
          expect($step).to.contain('Explore the possibilities!', 'Title')
          expect($step).to.contain(`more for a partition or the wall`, 'Description')
          cy.log('Step image is updated on thumbnail click')
          cy.get('[data-cy="active-image"]').should('have.attr', 'src').and('match', pic1Regex)
          cy.get('[data-cy=thumbnail]:eq(2)').click()
          cy.get('[data-cy="active-image"]').should('have.attr', 'src').and('match', pic3Regex)
        })

      })

      it('[Not interested and go back]', () => {
        cy.visit(specificHowtoUrl)
        cy.get('[data-cy="go-back"]:eq(0)').as('topBackButton')
          .click()
          .url().should('include', '/how-to')
      })

      it('[Finish reading and go back]', () => {
        cy.visit(specificHowtoUrl)
        cy.get('[data-cy="go-back"]:eq(1)').as('bottomBackButton')
          .click()
          .url().should('include', '/how-to')
      })
    })

  })

  describe('[Create a how-to]', () => {
    it('[By Anonymous]', () => {
      cy.log('Get redirected to /how-to when trying to create')
      cy.visit('/how-to')
      cy.logout()
      cy.visit('/how-to/create')
        .url().should('not.include', '/create')

    })

    it('[By Authenticated]', () => {
      cy.visit('/how-to')
      cy.login('howto_creator@test.com', 'test1234')
      cy.get('[data-cy=create]').click()

      cy.log('Fill up the intro')
      cy.get('[data-cy=intro-title').type('Create a how-to test')
      cy.get('[data-cy=tag-select]').click()
      cy.get('.data-cy__menu').contains('howto_testing').click()

      cy.get('[data-cy=time-select]').click()
      cy.get('.data-cy__menu').contains('1-2 weeks').click()

      cy.get('[data-cy=difficulty-select]').click()
      cy.get('.data-cy__menu').contains('Medium').click()
      cy.get('[data-cy=intro-description]').type('After creating, the how-to will be deleted')
      cy.get('[data-cy=intro-caption]').type('Intro caption goes here ...')

      cy.log('Upload a cover for the intro')
      const introPic = 'images/howto-intro.jpg'
      cy.fixture(introPic).then(fileContent => {
        cy.get('[data-cy=intro-cover]').find(':file').upload({
          fileContent,
          fileName: introPic,
          mimeType: 'image/jpg',
        })
      })

      cy.log('Add steps')
      cy.get('[data-cy=step]').its('length').should('be.eq', 3)
      cy.get('button[data-cy=add-step]').click()
      cy.get('[data-cy=step]').its('length').should('be.eq', 4)

      cy.get('[data-cy=delete-step]').each(($el) => {
        $el.trigger('click')
        cy.get('[data-cy=confirm]:visible').click()
      })
      cy.get('[data-cy=step]:visible').its('length').should('be.eq', 1)

      cy.log('Fill up a step info')
      cy.get('[data-cy=step]:eq(0)').within($firstStep => {
        cy.wrap($firstStep).contains('Step 1').should('be.exist')
        cy.get('[data-cy=step-title]').type('First step is easy')
        cy.get('[data-cy=step-description]').type('Description for the first step')
        cy.get('[data-cy=step-caption]').type('What a step caption')
        cy.get('[data-cy=delete-step]').should('not.exist')
      })
      cy.log('Upload pics for a step')
      const picNames = ['images/howto-step-pic1.jpg', 'images/howto-step-pic2.jpg']
      Cypress.Promise.all(picNames.map(fileName => {
        return new Cypress.Promise(resolve => {
          return cy.fixture(fileName).then(fileContent => {
            resolve({ fileName, fileContent })
          })
        })
      })).then((files: any[]) => {
        const fileData: FileData[] = files.map(f => {
          return { fileName: f.fileName, fileContent: f.fileContent, mimeType: 'image/jpg' }
        })
        cy.get('[data-cy=step]:visible').find(':file').upload(fileData)
      })
      cy.get('[data-cy=submit]').click()
      cy.wait(6000)
      cy.get('[data-cy=view-howto]').click()
        .url().should('include', '/how-to/create-a-howto-test')
      cy.get('[data-cy=how-to-basis]').contains('Create a how-to test').its('length').should('be.eq', 1)
    })
  })
})
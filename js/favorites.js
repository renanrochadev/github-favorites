import { GitHubUser } from "./GitHubUser.js"

//class that controls the data logic and structure
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()    
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GitHubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
      this.noitems()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login != user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
    this.noitems()
  }
  
}

// class that create the data visualization and html events
export class FavoritesView extends Favorites {
  constructor (root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.noitems()
    this.update()
    this.onadd()
  }

  noitems() {
    if (this.tbody.length == 0) {
      document.querySelector(".white-space").classList.remove("hide")
    } else {
      document.querySelector(".white-space").classList.add("hide")
    }
  }

  onadd()  {
    const addButton = this.root.querySelector('.search button')

    const input = this.root.querySelector('#input-search')

    
    addButton.addEventListener('click', () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    })
    input.addEventListener('keypress', (event) => {
      if (event.key === "Enter") {
        event.preventDefault()
        addButton.click()
      }
    })
  }

  update() {
    this.removeAllTr()

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')

        if(isOk) {
          this.delete(user)
        }
      }


      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    tr.classList.add('row-user')
    tr.innerHTML = `
          <td class="user">
            <img src="https://github.com/maykbrito.png" alt="imagem de maykbrito">
            <a href="https://github.com/maykbrito" target="_blank">
              <p>Mayk Brito</p>
              <span>maykbrito</span>
            </a>
          </td>
          <td class="repositories">
            76
          </td>
          <td class="followers">
            9589
          </td>
          <td>
            <button class="remove">Remover</button>
          </td>
    `
    return tr
  }

  removeAllTr() {

    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}
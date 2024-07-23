const botoes = document.querySelectorAll('.corpo__opcoes-botao')

botoes.forEach(botao => {
    let botaoId = botao.id
    let botaoClicado = document.getElementById(botaoId)
    botao.addEventListener('click', () => {
        ativarBotao(botaoClicado)
    })
})

function ativarBotao(botao) {
    let botaoConteudoClasse = `conteudo-${botao.id.split('-')[1]}`
    let conteudo = document.getElementsByClassName(botaoConteudoClasse)[0]

    if (botao.classList.contains('opcoes-link-ativo')) {
        botao.classList.remove('opcoes-link-ativo')
        conteudo.style.animation = 'fade-out .4s forwards'
        setTimeout(() => {
            conteudo.style.display = 'none'
        }, 400)
    } else if (document.getElementsByClassName('opcoes-link-ativo').length != 0) {
        botoes.forEach(item => {
            item.classList.remove('opcoes-link-ativo')
        })
        document.querySelectorAll('.corpo__conteudo').forEach(item => {
          item.style.animation = 'fade-out .2s forwards'
          setTimeout(() => {
             item.style.display = 'none'
          }, 200)
        })
        setTimeout(() => {
            botao.classList.add('opcoes-link-ativo')
            conteudo.style.display = 'flex'
            conteudo.style.animation = 'fade-in .4s forwards'
        }, 201)
    } else if (!botao.classList.contains('opcoes-link-ativo')) {
        botao.classList.add('opcoes-link-ativo')
        conteudo.style.display = 'flex'
        conteudo.style.animation = 'fade-in .4s forwards'
    }
}

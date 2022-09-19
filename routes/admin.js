const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send("Pagina de posts")
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) =>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) =>{
        req.flash('error_msg', 'Erro ao listar categorias')
        res.redirect('/categorias')
    })
    
})

router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req, res) =>{

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect("/admin/categorias")
        }).catch(() => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria.')
            res.redirect("/admin/categorias")
        })
    }
})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'A categoria não existe')
        res.redirect('/admin/categorias/')
    })
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        console.log(categoria.nome, categoria.slug)

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar categoria')
            res.redirect('/admin/categorias')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso.')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Ocorreu um erro interno.')
        res.redirect('admin/categorias')
    })
})

router.get('/postagens', (req, res) => {
    Postagem.find().populate('categoria').lean().sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    })
})

router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagens', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Erro interno')
        res.redirect('admin/postagens')
    })
})

router.post('/postagens/nova', (req, res) => {
    if (req.body.categoria == '0'){
        req.flash('error_msg', 'Selecione uma categoria!')
        res.redirect('/admin/postagens/add')
    } else {
        const post = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(post).save().then(() => {
            req.flash('success_msg', 'Postagem salva com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao salvar a postagem.')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
       Categoria.find().lean().then((categoria) => {
        res.render('admin/editpostagem', {postagem: postagem, categoria: categoria})
       })
    })
})

module.exports = router
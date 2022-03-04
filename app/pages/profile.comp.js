import {ArticleComponent} from "../components/article.comp";
import {Http} from "../http/http";
import {Authentication} from "../auth/authentication";
"use strict";


export class ProfileComponent extends HTMLElement {
    constructor(params) {
        super();
        this.username = params.username;

        this.followButtonHandler = this.followButtonHandler.bind(this);
        this.myArticlesButtonHandler = this.myArticlesButtonHandler.bind(this);
        this.favoritedArticlesButtonHandler = this.favoritedArticlesButtonHandler.bind(this);

        this.auth = Authentication.instance.auth;
    }

    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {
        Http.instance.doGet('profiles/' + this.username, true).then(res => {
            return res.json();
        }).then(r => {
            this.model = r.profile;
            this.innerHTML = this.render();
            this.$followButton = this.querySelector('#follow-button');
            if (this.$followButton) {
                this.$followButton.addEventListener('click', this.followButtonHandler);
            }
            this.$globalFeed = this.querySelector('#globalFeed');
            this.$myArticlesButton = this.querySelector('#my-articles');
            this.$favoritedArticlesButton = this.querySelector('#favorited-articles');

            this.$myArticlesButton.addEventListener('click', this.myArticlesButtonHandler);
            this.$favoritedArticlesButton.addEventListener('click', this.favoritedArticlesButtonHandler);

            this.fetchArticles('?author=' + this.username);
        });
    }

    disconnectedCallback () {
        if (this.$followButton) {
            this.$followButton.removeEventListener('click', this.followButtonHandler);
        }
    }

    followButtonHandler(e) {
        if (this.model.following) {
            Http.instance.doDelete('profiles/' + this.model.username + '/follow', true).then(r => {
                this.model = r.profile;
                this.$followButton.innerHTML = this.renderFollowButton();
            });
        } else {
            Http.instance.doPost('profiles/' + this.model.username + '/follow', JSON.stringify({}), true).then(r => {
                this.model = r.profile;
                this.$followButton.innerHTML = this.renderFollowButton();
            });
        }
    }

    renderFollowButton() {
        return `<i class="ion-plus-round"></i>${this.model.following ? 'Unfollow' : 'Follow'} ${this.username}`;
    }

    myArticlesButtonHandler(e) {
        e.preventDefault();
        this.fetchArticles('?author=' + this.username);
        this.$favoritedArticlesButton.classList.remove('active');
        this.$myArticlesButton.classList.add('active');
    }

    favoritedArticlesButtonHandler(e) {
        e.preventDefault();
        this.fetchArticles('?favorited=' + this.username);
        this.$favoritedArticlesButton.classList.add('active');
        this.$myArticlesButton.classList.remove('active');
    }

    fetchArticles(params) {
        this.cleanGlobalFeed();
        this.$globalFeed.innerHTML = '<div class="article-preview">Loading articles </div>';
        Http.instance.doGet('articles' + params, true).then(function (response) {
            return response.json();
        }).then(r => {
            this.$globalFeed.textContent = '';
            r.articles.forEach(article => {
                this.generateArticle(article);
            });
            if(r.articles.length === 0) {
                this.$globalFeed.innerHTML = '<div class="article-preview">No articles are here... yet. </div>';
            }
        });
    }

    cleanGlobalFeed() {
        while (this.$globalFeed.firstChild) {
            this.$globalFeed.removeChild(this.$globalFeed.firstChild);
        }
        return this.$globalFeed;
    }

    generateArticle(article) {
        if (!article.author.image) {
            article.author.image = 'https://static.productionready.io/images/smiley-cyrus.jpg';
        }
        let articleComponent = new ArticleComponent();
        articleComponent.model = article;
        this.$globalFeed.appendChild(articleComponent);
    }


    render() {
        return `
            <div class="profile-page">
                <div class="user-info">
                  <div class="container">
                    <div class="row">
                      <div class="col-xs-12 col-md-10 offset-md-1">
                        <img id="user-img" src="${this.model.image}" class="user-img" />
                        <h4 id="username">${this.username}</h4>
                        <p id="bio">
                          ${this.model.bio ? this.model.bio : ''}
                        </p>
                        ${!this.auth || this.username !== this.auth.username ?
                          `<button id="follow-button" class="btn btn-sm btn-outline-secondary action-btn">
                            ${this.renderFollowButton()}
                          </button>` :
                          `<a class="btn btn-sm btn-outline-secondary action-btn" href="/#/settings"><i class="ion-gear-a"></i> Edit Profile Settings</a>`
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div class="container">
                  <div class="row">
                    <div class="col-xs-12 col-md-10 offset-md-1">
                      <div class="articles-toggle">
                        <ul class="nav nav-pills outline-active">
                        <li class="nav-item">
                          <a id="my-articles" class="nav-link active" href="">My Articles</a>
                        </li>
                        <li class="nav-item">
                          <a id="favorited-articles" class="nav-link" href="">Favorited Articles</a>
                        </li>
                        </ul>
                      </div>
                      <div id="globalFeed">
                        <div class="article-preview">
                          Loading articles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        `;
    }

}

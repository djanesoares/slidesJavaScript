import debounce from './debounce.js';

export class Slide {

  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide)
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosition: 0, startX: 0, movement: 0 }
    this.activeClass = 'active';

    // criando um evento
    this.changeEvent = new Event('changeEvent');
  }

  transition(active){
    this.slide.style.transition = active ? "transforme .3s": '';
  }

  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  onStart(event) {
    let movetype;
    if (event.type === 'mousedown') {
      event.preventDefault();
      this.dist.startX = event.clientX;
      movetype = 'mousemove';
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = 'touchmove';
    }
    this.wrapper.addEventListener(movetype, this.onMove);
    this.transition(false);
  }

  onMove(event) {
    const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const movetype = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
    this.wrapper.removeEventListener(movetype, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
    
  }

// para mudar o slide ao final, quando terminar o movimento e o usuário tirar o mouse
  changeSlideOnEnd() {
    if(this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    }else if(this.dist.movement < -120 && this.index.prev !== undefined){
      this.activePrevSlide();
    }else {
      this.changeSlide(this.index.active);
    }
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }



  // Slides config

  // centralizando a imagem, fazendo o calculo com as margens e tamanha para que a imagem fique centralizada
  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  // configuração para pegar cada um dos slides na li e suas propriedades
  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { position, element };
    });
  }

  // colocando o anterior e o próximo como undefined
  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    }
  }

  // fazendo a mudança do slide de acordo com a posição selecionada [index], definindo qual é o atual e qual é o próximo.
  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  // para mudar a classe em ativo e não ativo
  changeActiveClass() {
    this.slideArray.forEach(item => item.element.classList.remove(this.activeClass));
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  // quando não for undefined mostre o anterior slide
  activePrevSlide(){
    if(this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

    // quando não for undefined mostre o próximo slide
  activeNextSlide(){
    if(this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  // caso o resize aconteça crie novamente a função slideconfig que cria a array com a configuração de onde está o elemento

  onResize(){
    setTimeout(()=> {
      this.slidesConfig();
      this.changeSlide(this.index.active); // reposiocionando o slide novamente
    },1000);
   
  }

  addResizeEvent(){
    window.addEventListener('resize', this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);

    this.onResize = debounce(this.onResize.bind(this),200);
  }

  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent()
    this.changeSlide(0);
    
    return this;
  }
}

export default class SlideNav extends Slide {

  constructor(slide, wrapper){
    super(slide, wrapper)
    this.bindControlEvents()
  }
  
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();

  }

  addArrowEvent() {
    this.prevElement.addEventListener('click', this.activePrevSlide);
    this.nextElement.addEventListener('click', this.activeNextSlide);
  }

  // faz apresentar as bolinhas para paginação
  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';

  this.slideArray.forEach((item,index) => {
    control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`
  });
    this.wrapper.appendChild(control); // adicionando automaticamente o número da navegaçao dos slides no body
    return control;
  }

  // criando o evento e adicionando a cada um dos itens 
  eventControl(item, index){
    item.addEventListener('click',(event) =>{
      event.preventDefault();
      this.changeSlide(index);
      });
    this.wrapper.addEventListener('changeEvent', this.activeControlItem);
  }

  activeControlItem(){
    this.controlArray.forEach(item => item.classList.remove(this.activeClass));
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  // adicionando o evento criado -
  // addControl(){
  //   this.control = this.createControl();
  //   console.log(this.control)
  // }


  // dando a capacidade do usuário criar o próprio controle

  addControl(CustomControl){
    this.control = document.querySelector(CustomControl) || this.createControl();

    this.controlArray = [...this.control.children];

    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);

  }

  bindControlEvents(){
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
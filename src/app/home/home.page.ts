import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import type { Animation, Gesture, GestureDetail } from '@ionic/angular';
import { AnimationController, IonCard, GestureController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

  @ViewChild(IonCard, { read: ElementRef }) card: ElementRef<HTMLIonCardElement> | undefined;

  private animation: Animation | undefined;
  private gesture: Gesture | undefined;
  private started = false;
  private initialStep = 0;
  private readonly MAX_TRANSLATE = 344 - 100 - 32;

  constructor(private animationCtrl: AnimationController, private gestureCtrl: GestureController) {}

  private onMove(ev: GestureDetail) {
    if (this.animation && !this.started) {
      this.animation.progressStart();
      this.started = true;
    }

    if (this.animation) {
      this.animation.progressStep(this.getStep(ev));
    }
  }

  private onEnd(ev: GestureDetail) {
    if (!this.started || !this.animation || !this.gesture) {
      return;
    }

    this.gesture.enable(false);

    const step = this.getStep(ev);
    const shouldComplete = step > 0.5;

    this.animation.progressEnd(shouldComplete ? 1 : 0, step).onFinish(() => {
      if (this.gesture) {
        this.gesture.enable(true);
      }
    });

    this.initialStep = shouldComplete ? this.MAX_TRANSLATE : 0;
    this.started = false;
  }

  private clamp(min: number, n: number, max: number) {
    return Math.max(min, Math.min(n, max));
  }

  private getStep(ev: GestureDetail) {
    const delta = this.initialStep + ev.deltaX;
    return this.clamp(0, delta / this.MAX_TRANSLATE, 1);
  }

  ngAfterViewInit() {
    if (this.card && this.card.nativeElement) {
      // Crear animación de anchura
      this.animation = this.animationCtrl
        .create()
        .addElement(this.card.nativeElement)
        .duration(3000)
        .iterations(Infinity)
        .keyframes([
          { offset: 0, width: '80px' },
          { offset: 0.72, width: 'var(--width)' },
          { offset: 1, width: '240px' },
        ]);

      // Crear animación de desplazamiento
      const slideAnimation = this.animationCtrl
        .create()
        .addElement(this.card.nativeElement)
        .duration(1000)
        .fromTo('transform', 'translateX(0)', `translateX(${this.MAX_TRANSLATE}px)`);

      // Crear gesto de arrastre
      this.gesture = this.gestureCtrl.create({
        el: this.card.nativeElement,
        threshold: 0,
        gestureName: 'card-drag',
        onMove: (ev) => this.onMove(ev),
        onEnd: (ev) => this.onEnd(ev),
      });
  
      this.gesture.enable(true);
    } else {
      console.error("El elemento 'card' no está disponible.");
    }
  }

  play() {
    if (this.animation) {
      this.animation.play();
    } else {
      console.error("La animación no está definida.");
    }
  }

  pause() {
    if (this.animation) {
      this.animation.pause();
    } else {
      console.error("La animación no está definida.");
    }
  }

  stop() {
    if (this.animation) {
      this.animation.stop();
    } else {
      console.error("La animación no está definida.");
    }
  }
}

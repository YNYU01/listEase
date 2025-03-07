class btnadd extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="100%" height="100%" viewBox="0 0 17 17">
          <g>
              <g>
                  <rect x="7.5" y="3.5" width="2" height="10" rx="0" fill="var(--mainColor)" fill-opacity="1"/>
              </g>
              <g>
                  <rect x="3.5" y="7.5" width="10" height="2" rx="0" fill="var(--mainColor)" fill-opacity="1"/>
              </g>
              <g>
                  <ellipse cx="8.5" cy="8.5" rx="8" ry="8" fill-opacity="0" stroke-opacity="1" stroke="var(--mainColor)" fill="none" stroke-width="1"/>
              </g>
          </g>
      </svg>
      `;
    }
  }
customElements.define('btn-add', btnadd);

class btnclose extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="100%" height="100%" viewBox="0 0 17 17">
            <g>
                <g>
                    <rect x="3.5" y="7.5" width="10" height="2" rx="0" fill="var(--mainColor)" fill-opacity="1"/>
                </g>
                <g>
                    <ellipse cx="8.5" cy="8.5" rx="8" ry="8" fill-opacity="0" stroke-opacity="1" stroke="var(--mainColor)" fill="none" stroke-width="1"/>
                </g>
            </g>
        </svg>
        `;
    }
}
customElements.define('btn-close', btnclose);

class btncopy extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="100%" height="100%" viewBox="0 0 11 11">
            <g>
                <g>
                    <path d="M5,2L4,2L4,4L2,4L2,5L4,5L4,7L5,7L5,5L7,5L7,4L5,4L5,2Z" fill-rule="evenodd" fill="var(--mainColor)" fill-opacity="1"/>
                </g>
                <g>
                    <path d="M0,2.5L0,6.5Q0,7.53553,0.732233,8.26777Q1.29574,8.83127,2.03888,8.96112Q2.16872,9.70426,2.73223,10.2678Q3.46447,11,4.5,11L8.5,11Q9.53553,11,10.2678,10.2678Q11,9.53553,11,8.5L11,4.5Q11,3.46447,10.2678,2.73223Q9.70426,2.16872,8.96112,2.03888Q8.83127,1.29574,8.26777,0.732233Q7.53553,0,6.5,0L2.5,0Q1.46447,0,0.732233,0.732233Q0,1.46447,0,2.5ZM9,3.08099L9,6.5Q9,7.53553,8.26777,8.26777Q7.53553,9,6.5,9L3.08099,9Q3.18864,9.30996,3.43934,9.56066Q3.87868,10,4.5,10L8.5,10Q9.12132,10,9.56066,9.56066Q10,9.12132,10,8.5L10,4.5Q10,3.87868,9.56066,3.43934Q9.30996,3.18864,9,3.08099ZM1.43934,7.56066Q1,7.12132,1,6.5L1,2.5Q1,1.87868,1.43934,1.43934Q1.87868,1,2.5,1L6.5,1Q7.12132,1,7.56066,1.43934Q8,1.87868,8,2.5L8,6.5Q8,7.12132,7.56066,7.56066Q7.12132,8,6.5,8L2.5,8Q1.87868,8,1.43934,7.56066Z" fill-rule="evenodd" fill="var(--mainColor)" fill-opacity="1"/>
                </g>
            </g>
        </svg>
        `;
    }
}
customElements.define('btn-copy', btncopy);

class btnre extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="100%" height="100%" viewBox="0 0 20 20">
            <g>
                <g>
                    <path d="M12.2855,7.6273202612304685L11.71607,9.752400261230468L6.11928,3.5940002612304687L14.0454,1.0590667722304687L13.5682,2.8400802612304688C16.2837,4.193330261230469,18,6.966240261230468,18,10.000240261230468C18,12.14093026123047,17.142,14.192330261230468,15.618,15.695630261230468C15.8708,14.991330261230468,16,14.248530261230469,16,13.500230261230469C16,10.989500261230468,14.554,8.703270261230468,12.2855,7.6273202612304685ZM6.43178,17.16043026123047L5.95456,18.94143026123047L13.8807,16.40643026123047L8.28393,10.248070261230469L7.71452,12.373130261230468C5.446,11.29723026123047,4,9.010970261230469,4,6.500240261230469C4,5.751890261230469,4.12923,5.009170261230469,4.38199,4.304810261230468C2.857956,5.808120261230469,2,7.859530261230469,2,10.000240261230468C2,13.03423026123047,3.71629,15.80713026123047,6.43178,17.16043026123047Z" fill-rule="evenodd" fill="var(--boxBod)" fill-opacity="1"/>
                </g>
            </g>
        </svg>
        `;
    }
}
customElements.define('btn-re', btnre);

class btnchange extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="100%" height="100%" viewBox="0 0 18 12">
            <g>
                <g>
                    <path d="M7.84606,8.545449999999999L7.84606,10L3.9999561143,8.25454L3.9999561143,7.09091L7.07693,7.09091L7.84606,7.09091L13.99991,7.09091L13.99991,8.545449999999999L7.84606,8.545449999999999ZM10.15385,3.4545500000000002L10.15385,2L13.99996,3.74546L13.99996,4.90909L10.15385,4.90909L4,4.90909L4,3.4545500000000002L10.15385,3.4545500000000002Z" 
                    fill-rule="evenodd" fill="var(--mainColor3)" fill-opacity="1"/>
                </g>
            </g>
        </svg>
        `;
    }
}
customElements.define('btn-change', btnchange);
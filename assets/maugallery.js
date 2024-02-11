function mauGallery(selector, options) {
  var defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  options = Object.assign({}, defaults, options);
  var tagsCollection = [];

  document.querySelectorAll(selector).forEach(function (element) {
    createRowWrapper(element);

    if (options.lightBox) {
      createLightBox(element, options.lightboxId, options.navigation);
    }
    listeners(options);

    element.querySelectorAll(".gallery-item").forEach(function (item) {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      wrapItemInColumn(item, options.columns);
      var theTag = item.dataset.galleryTag;
      if (
        options.showTags &&
        theTag !== undefined &&
        tagsCollection.indexOf(theTag) === -1
      ) {
        tagsCollection.push(theTag);
      }
    });

    if (options.showTags) {
      showItemTags(element, options.tagsPosition, tagsCollection);
    }

    element.style.display = "block";
  });

  function createRowWrapper(element) {
    if (!element.children[0].classList.contains("row")) {
      var rowWrapper = document.createElement("div");
      rowWrapper.classList.add("gallery-items-row", "row");
      element.appendChild(rowWrapper);
    }
  }

  function wrapItemInColumn(element, columns) {
    var columnClasses = '';
    if (typeof columns === 'number') {
      columnClasses = `col-${Math.ceil(12 / columns)}`;
    } else if (typeof columns === 'object') {
      columnClasses = Object.keys(columns).map(function(key) {
        return `col-${key}-${Math.ceil(12 / columns[key])}`;
      }).join(' ');
    } else {
      console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      return;
    }
    var columnWrapper = document.createElement('div');
    columnWrapper.classList.add('item-column', 'mb-4');
    columnWrapper.classList.add(...columnClasses.split(' ')); // Utiliser le spread operator pour ajouter les classes individuellement
    element.parentNode.insertBefore(columnWrapper, element);
    columnWrapper.appendChild(element);
  }

  function moveItemInRowWrapper(element) {
    element.parentNode.querySelector(".gallery-items-row").appendChild(element);
  }

  function responsiveImageItem(element) {
    if (element.tagName === "IMG") {
      element.classList.add("img-fluid");
    }
  }

  function createLightBox(gallery, lightboxId, navigation) {
    var lightboxContent = `
        <div class="modal fade" id="${
          lightboxId ? lightboxId : "galleryLightbox"
        }" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${
                  navigation
                    ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                    : '<span style="display:none;" />'
                }
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                ${
                  navigation
                    ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                    : '<span style="display:none;" />'
                }
              </div>
            </div>
          </div>
        </div>`;
    gallery.insertAdjacentHTML("beforeend", lightboxContent);
  }

  function showItemTags(gallery, position, tags) {
    var tagItems =
      '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
    tags.forEach(function (tag) {
      tagItems += `<li class="nav-item active">
          <span class="nav-link"  data-images-toggle="${tag}">${tag}</span></li>`;
    });
    var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

    if (position === "bottom") {
      gallery.insertAdjacentHTML("beforeend", tagsRow);
    } else if (position === "top") {
      gallery.insertAdjacentHTML("afterbegin", tagsRow);
    } else {
      console.error(`Unknown tags position: ${position}`);
    }
  }

  function listeners(options) {
    document.querySelectorAll(".gallery-item").forEach(function (item) {
      item.addEventListener("click", function () {
        if (options.lightBox && item.tagName === "IMG") {
          openLightBox(item, options.lightboxId);
        } else {
          return;
        }
      });
    });

    document
      .querySelector(".gallery")
      .addEventListener("click", function (event) {
        if (event.target.classList.contains("nav-link")) {
          filterByTag.call(event.target);
        } else if (event.target.classList.contains("mg-prev")) {
          prevImage(options.lightboxId);
        } else if (event.target.classList.contains("mg-next")) {
          nextImage(options.lightboxId);
        }
      });
  }

  function openLightBox(element, lightboxId) {
    document
      .querySelector(`#${lightboxId}`)
      .querySelector(".lightboxImage").src = element.src;
    var modal = new bootstrap.Modal(document.querySelector(`#${lightboxId}`));
    modal.show();
  }

  function prevImage(lightboxId) {
    var activeImage = null;
    document.querySelectorAll("img.gallery-item").forEach(function (img) {
      if (img.src === document.querySelector(".lightboxImage").src) {
        activeImage = img;
      }
    });
    var activeTag = document.querySelector(".tags-bar span.active-tag").dataset
      .imagesToggle;
    var imagesCollection = [];
    if (activeTag === "all") {
      document.querySelectorAll(".item-column").forEach(function (column) {
        if (column.querySelector("img")) {
          imagesCollection.push(column.querySelector("img"));
        }
      });
    } else {
      document.querySelectorAll(".item-column").forEach(function (column) {
        if (column.querySelector("img").dataset.galleryTag === activeTag) {
          imagesCollection.push(column.querySelector("img"));
        }
      });
    }
    var index = 0,
      next = null;
    imagesCollection.forEach(function (img, i) {
      if (activeImage.src === img.src) {
        index = i - 1;
      }
    });
    next =
      imagesCollection[index] || imagesCollection[imagesCollection.length - 1];
    document.querySelector(".lightboxImage").src = next.src;
  }

  function nextImage(lightboxId) {
    var activeImage = null;
    document.querySelectorAll("img.gallery-item").forEach(function (img) {
      if (img.src === document.querySelector(".lightboxImage").src) {
        activeImage = img;
      }
    });
    var activeTag = document.querySelector(".tags-bar span.active-tag").dataset
      .imagesToggle;
    var imagesCollection = [];
    if (activeTag === "all") {
      document.querySelectorAll(".item-column").forEach(function (column) {
        if (column.querySelector("img")) {
          imagesCollection.push(column.querySelector("img"));
        }
      });
    } else {
      document.querySelectorAll(".item-column").forEach(function (column) {
        if (column.querySelector("img").dataset.galleryTag === activeTag) {
          imagesCollection.push(column.querySelector("img"));
        }
      });
    }
    var index = 0,
      next = null;
    imagesCollection.forEach(function (img, i) {
      if (activeImage.src === img.src) {
        index = i + 1;
      }
    });
    next = imagesCollection[index] || imagesCollection[0];
    document.querySelector(".lightboxImage").src = next.src;
  }

  function filterByTag() {
    if (this.classList.contains("active-tag")) {
      return;
    }
    document
      .querySelector(".active.active-tag")
      .classList.remove("active", "active-tag");
    this.classList.add("active-tag", "active");
    var tag = this.dataset.imagesToggle;
    document.querySelectorAll(".gallery-item").forEach(function (item) {
      var parentColumn = item.closest(".item-column");
      if (tag === "all" || item.dataset.galleryTag === tag) {
        parentColumn.style.display = "block";
      } else {
        parentColumn.style.display = "none";
      }
    });
  }
}

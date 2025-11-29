document.addEventListener('DOMContentLoaded', function () {
  if (token) {
    fetch('http://localhost:8081/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        feedUserInfo(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    function feedUserInfo(userData) {
      if (!userData) return;
      showAdminSection(userData.role);
      if (userData.profilePic !== undefined) {
        document.getElementById('user-avatar').src = `data:image/jpeg;base64,${userData.profilePic}`;
      } else {
        document.getElementById('user-avatar').src = '/assets/images/avatar.png';
      }
      document.getElementById('username-sidebar').textContent = userData.name;
      const roleText = userData.role === 'ROLE_ADMIN' ? 'Admin' : 'Usuário';
      document.getElementById('user-role-sidebar').textContent = roleText;
    }

    function showAdminSection(role) {
      if (role === 'ROLE_ADMIN') {
        document.getElementById('admin-section').style.display = 'block';
      } else {
        document.getElementById('admin-section').style.display = 'none';
      }
    }

  } else {
    document.getElementById('username-sidebar').textContent = 'Visitante';
    document.getElementById('user-role-sidebar').textContent

    document.getElementById('profile').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('logout_btn').style.display = 'none';
  }

  document.getElementById('open_btn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open-sidebar');
  });

  const path = window.location.pathname;
  const navItems = {
    '/pages/index.html': 'nav-loja',
    '/pages/profile/profile.html': 'profile',
    '/pages/admin/admin.html': 'admin-section'
  };

  Object.keys(navItems).forEach(key => {
    const element = document.getElementById(navItems[key]);
    if (element) {
      if (path.includes(key)) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    }
  });
});

document.getElementById('logout').addEventListener('click', function () {
  if (token) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = '/pages/index.html';
  }
});